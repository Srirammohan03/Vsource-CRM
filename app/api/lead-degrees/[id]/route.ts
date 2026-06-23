// app\api\lead-degrees\[id]\route.ts
import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { handleError, notFound, ok } from "@/lib/api-helpers";
import { LeadDegreeCreateSchema } from "@/lib/schemas";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const body = await req.json();

    const degree = await db.leadDegree.update({
      where: { id },
      data: {
        status: body.status,
      },
    });

    return ok(degree, "Lead degree status updated successfully");
  } catch (err) {
    return handleError(err);
  }
}
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const body = LeadDegreeCreateSchema.partial().parse(await req.json());

    const degree = await db.leadDegree.update({
      where: { id },
      data: body,
    });

    return ok(degree, "Lead degree updated successfully");
  } catch (err) {
    return handleError(err);
  }
}
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const degree = await db.leadDegree.findUnique({
      where: { id },
    });

    if (!degree) {
      return notFound("Lead Degree");
    }

    await db.leadDegree.delete({
      where: { id },
    });

    return Response.json({
      success: true,
      message: "Lead degree deleted successfully",
    });
  } catch (err) {
    return handleError(err);
  }
}
