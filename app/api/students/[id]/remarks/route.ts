import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";
import { getAuthorizedUser } from "@/lib/rbac";
import { MODULES, PERMISSIONS } from "@/lib/module-codes";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthorizedUser(
      req,
      MODULES.APPLICATIONS,
      PERMISSIONS.CREATE,
    );

    const { id } = await params;

    const body = await req.json();

    if (!body.note?.trim()) {
      throw new Error("Remark cannot be empty");
    }

    const remark = await prisma.studentRemark.create({
      data: {
        studentId: id,
        note: body.note,
        createdById: user.id,
      },
    });

    return ok(remark, "Remark added successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Student ID is required",
        },
        { status: 400 },
      );
    }

    const remarks = await prisma.studentRemark.findMany({
      where: { studentId: id },
      include: {
        createdBy: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(remarks, "remarks fetched successfully");
  } catch (error) {
    return handleError(error);
  }
}
