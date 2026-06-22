import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await req.json();

    if (!body.note?.trim()) {
      throw new Error("Remark cannot be empty");
    }

    const remark = await prisma.studentRemark.create({
      data: {
        studentId: id,
        note: body.note,
      },
    });

    return ok(remark, "Remark added successfully");
  } catch (error) {
    return handleError(error);
  }
}
