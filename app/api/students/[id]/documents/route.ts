import { NextRequest, NextResponse } from "next/server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { handleError, ok } from "@/lib/api-helpers";

export const runtime = "nodejs";

// 1. GET: Fetch all documents for a specific student
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing student identification parameter.",
        },
        { status: 400 },
      );
    }
    const documents = await prisma.studentDocument.findMany({
      where: { id },
      orderBy: { uploadedAt: "desc" },
    });

    return ok(documents, "Documents fetched successfully");
  } catch (error) {
    return handleError(error);
  }
}

// 2. POST: Upload and bind a new document
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing student identification identifier.",
        },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;

    if (!file || !documentType) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required form-data (file or documentType).",
        },
        { status: 400 },
      );
    }

    // Validate File Types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid type. Allowed: JPG, PNG, WEBP, or PDF.",
        },
        { status: 400 },
      );
    }

    // Validate File Size (Max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          message: "File exceeds safe threshold limit of 5MB.",
        },
        { status: 400 },
      );
    }

    // Generate safe dynamic filenames
    const originalExt = file.name.split(".").pop()?.toLowerCase() || "";
    const validExts: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "application/pdf": "pdf",
    };
    const safeExt = validExts[file.type] || originalExt || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

    // Establish Target Upload Directories
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Write file to filesystem disk buffer array
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    const fileUrl = `/uploads/${filename}`;

    // Save metadata record into database
    const newDocument = await prisma.studentDocument.create({
      data: {
        studentId: id,
        documentType,
        fileName: file.name,
        fileUrl: fileUrl,
      },
    });

    return ok(newDocument, "Document registered and saved successfully.");
  } catch (error) {
    return handleError(error);
  }
}
