/**
 * api/intakes/[id]/route.ts
 * GET    /api/intakes/:id
 * PUT  /api/intakes/:id
 * DELETE /api/intakes/:id
 */

import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { ok, notFound, noContent, handleError } from "@/lib/api-helpers";
import { IntakeUpdateSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const intake = await db.intake.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            degree: true,
            university: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!intake) return notFound("Intake");
    return ok(intake);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = IntakeUpdateSchema.parse(await req.json());
    const intake = await db.intake.update({ where: { id }, data: body });
    return ok(intake, "Intake updated successfully");
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await db.intake.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
