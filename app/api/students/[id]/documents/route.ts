import { mkdir, writeFile } from "fs/promises";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;

    const student = await db.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const checklist = STUDENT_DOCUMENT_CHECKLIST.map((item) => {
      const documents = student.documents.filter(
        (document) => document.documentCode === item.code,
      );

      return {
        ...item,
        isMandatory: true,
        module: item.category.startsWith("LOAN") ? "LOAN" : "ADMISSION",
        documents,
        uploadedCount: documents.length,
        isComplete: documents.length >= item.requiredCount,
      };
    });

    const totalRequiredUploads = checklist.reduce(
      (total, item) => total + item.requiredCount,
      0,
    );

    const completedRequiredUploads = checklist.reduce(
      (total, item) => total + Math.min(item.uploadedCount, item.requiredCount),
      0,
    );

    const completedChecklistItems = checklist.filter(
      (item) => item.isComplete,
    ).length;

    const summary = {
      totalChecklistItems: checklist.length,
      completedChecklistItems,
      pendingChecklistItems: checklist.length - completedChecklistItems,
      totalRequiredUploads,
      completedRequiredUploads,
      percentage:
        totalRequiredUploads === 0
          ? 0
          : Math.round((completedRequiredUploads / totalRequiredUploads) * 100),
    };

    return NextResponse.json({
      success: true,
      data: {
        checklist,
        summary,
        hasUploadedDocuments: student.documents.length > 0,
      },
    });
  } catch (error) {
    console.error("[student-documents:get]", error);
    return errorResponse("Unable to load student documents", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;
    const formData = await req.formData();

    const file = formData.get("file");
    const documentCode = String(formData.get("documentCode") || "").trim();
    const remarks = String(formData.get("remarks") || "").trim();

    if (!(file instanceof File)) {
      return errorResponse("Document file is required", 400);
    }

    const checklistItem = STUDENT_DOCUMENT_CHECKLIST.find(
      (item) => item.code === documentCode,
    );

    if (!checklistItem) {
      return errorResponse("Invalid document type", 400);
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        studentName: true,
        branch: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const extension = validateStudentDocument(file);

    const storedFileName = buildStudentDocumentFileName({
      studentName: student.studentName,
      documentName: checklistItem.name,
      branchCode: student.branch?.code || "branch",
      extension,
    });

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "upload",
      "student",
    );

    await mkdir(uploadDirectory, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(uploadDirectory, storedFileName), buffer, {
      flag: "wx",
    });

    const document = await db.studentDocument.create({
      data: {
        studentId,
        documentCode: checklistItem.code,
        documentType: checklistItem.name,
        originalFileName: file.name,
        storedFileName,
        fileUrl: `/upload/student/${storedFileName}`,
        mimeType: file.type,
        fileSize: file.size,
        remarks: remarks || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: document,
        message: "Document uploaded successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[student-documents:post]", error);

    return errorResponse(
      error instanceof Error ? error.message : "Document upload failed",
      500,
    );
  }
}
