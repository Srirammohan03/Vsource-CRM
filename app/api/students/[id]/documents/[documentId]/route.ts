import { unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { STUDENT_DOCUMENT_CHECKLIST } from "@/lib/student-document-checklist";
import {
  buildStudentDocumentFileName,
  validateStudentDocument,
} from "@/lib/student-document-utils";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function removeStoredFile(fileUrl: string) {
  const safeFileName = path.basename(fileUrl);
  const filePath = path.join(
    process.cwd(),
    "public",
    "upload",
    "student",
    safeFileName,
  );

  await unlink(filePath).catch(() => undefined);
}

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; documentId: string }>;
  },
) {
  try {
    const { id: studentId, documentId } = await params;
    const formData = await req.formData();

    const file = formData.get("file");
    const remarks = String(formData.get("remarks") || "").trim();

    const existingDocument = await db.studentDocument.findFirst({
      where: {
        id: documentId,
        studentId,
      },
      include: {
        student: {
          select: {
            studentName: true,
            branch: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!existingDocument) {
      return errorResponse("Document not found", 404);
    }

    if (!(file instanceof File)) {
      const updatedDocument = await db.studentDocument.update({
        where: { id: documentId },
        data: {
          remarks: remarks || null,
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedDocument,
        message: "Document updated successfully",
      });
    }

    const checklistItem = STUDENT_DOCUMENT_CHECKLIST.find(
      (item) => item.code === existingDocument.documentCode,
    );

    if (!checklistItem) {
      return errorResponse("Document checklist item not found", 400);
    }

    const extension = validateStudentDocument(file);

    const storedFileName = buildStudentDocumentFileName({
      studentName: existingDocument.student.studentName,
      documentName: checklistItem.name,
      branchCode: existingDocument.student.branch?.code || "branch",
      extension,
    });

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "upload",
      "student",
    );

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(uploadDirectory, storedFileName), buffer, {
      flag: "wx",
    });

    const updatedDocument = await db.studentDocument.update({
      where: { id: documentId },
      data: {
        originalFileName: file.name,
        storedFileName,
        fileUrl: `/upload/student/${storedFileName}`,
        mimeType: file.type,
        fileSize: file.size,
        remarks: remarks || null,
        uploadedAt: new Date(),
      },
    });

    await removeStoredFile(existingDocument.fileUrl);

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: "Document replaced successfully",
    });
  } catch (error) {
    console.error("[student-document:put]", error);

    return errorResponse(
      error instanceof Error ? error.message : "Unable to update document",
      500,
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; documentId: string }>;
  },
) {
  try {
    const { id: studentId, documentId } = await params;

    const document = await db.studentDocument.findFirst({
      where: {
        id: documentId,
        studentId,
      },
    });

    if (!document) {
      return errorResponse("Document not found", 404);
    }

    await db.studentDocument.delete({
      where: { id: documentId },
    });

    await removeStoredFile(document.fileUrl);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("[student-document:delete]", error);
    return errorResponse("Unable to delete document", 500);
  }
}
