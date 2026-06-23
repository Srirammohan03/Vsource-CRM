// app/api/lead-sources/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { handleError, ok } from "@/lib/api-helpers";
import { LeadSourceCreateSchema } from "@/lib/schemas";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const body = await req.json();

    const source = await db.leadSource.update({
      where: { id },
      data: {
        status: body.status,
      },
    });

    return ok(source, "Lead source status updated successfully");
  } catch (err) {
    return handleError(err);
  }
}
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const body = LeadSourceCreateSchema.partial().parse(await req.json());

    const source = await db.leadSource.update({
      where: { id },
      data: body,
    });

    return ok(source, "Lead source updated successfully");
  } catch (err) {
    return handleError(err);
  }
}
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    await db.leadSource.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Lead source deleted successfully",
    });
  } catch (err) {
    return handleError(err);
  }
}
