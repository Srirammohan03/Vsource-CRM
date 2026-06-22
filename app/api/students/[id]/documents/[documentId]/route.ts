import { NextRequest, NextResponse } from "next/server";

import { unlink } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; documentId: string } },
) {
  try {
    const { id, documentId } = params;

    if (!id || !documentId) {
      return NextResponse.json(
        { success: false, message: "Missing resource routing identifiers." },
        { status: 400 },
      );
    }

    // Find Document metadata track
    const document = await prisma.studentDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, message: "Target document could not be located." },
        { status: 404 },
      );
    }

    // Purge physical disk block storage tracking safely
    if (document.fileUrl.startsWith("/uploads/")) {
      const physicalPath = path.join(process.cwd(), "public", document.fileUrl);
      try {
        await unlink(physicalPath);
      } catch (err) {
        console.warn(
          `[Disk Purge Warning]: File not found on disk at ${physicalPath}, proceeding with database drop.`,
        );
      }
    }

    // Delete records from database ledger map
    await prisma.studentDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json({
      success: true,
      message: "Resource metadata and file block dropped successfully.",
    });
  } catch (error) {
    console.error("[DMS_DELETE_ERR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to purge database metadata entries." },
      { status: 500 },
    );
  }
}
