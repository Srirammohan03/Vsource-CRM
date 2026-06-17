/**
 * api/mbbs-leads/[id]/route.ts
 * GET    /api/mbbs-leads/:id
 * PUT  /api/mbbs-leads/:id
 * DELETE /api/mbbs-leads/:id
 */

import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { ok, notFound, noContent, handleError } from "@/lib/api-helpers";
import { MbbsLeadUpdateSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const lead = await db.mbbsLead.findUnique({
      where: { id },
      include: {
        branch: true,
        assignedCounselor: { select: { id: true, name: true, email: true } },
        timelines: {
          include: {
            createdBy: { select: { id: true, name: true } },
            updatedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!lead) return notFound("MBBS Lead");
    return ok(lead);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = MbbsLeadUpdateSchema.parse(await req.json());
    const lead = await db.mbbsLead.update({
      where: { id },
      data: body,
      include: {
        branch: { select: { id: true, name: true } },
        assignedCounselor: { select: { id: true, name: true } },
      },
    });
    return ok(lead, "MBBS Lead updated successfully");
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await db.mbbsLead.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
