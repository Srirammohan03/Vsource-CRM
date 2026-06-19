// app/api/lead-universities/[id]/route.ts

import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { handleError, notFound, ok } from "@/lib/api-helpers";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(
    req: NextRequest,
    { params }: RouteContext,
) {
    try {
        const { id } = await params;

        const body = await req.json();

        const university = await db.leadUniversity.update({
            where: { id },
            data: {
                status: body.status,
            },
        });

        return ok(
            university,
            "Lead university status updated successfully",
        );
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: RouteContext,
) {
    try {
        const { id } = await params;

        const university = await db.leadUniversity.findUnique({
            where: { id },
        });

        if (!university) {
            return notFound("Lead University");
        }

        await db.leadUniversity.delete({
            where: { id },
        });

        return Response.json({
            success: true,
            message: "Lead university deleted successfully",
        });
    } catch (err) {
        return handleError(err);
    }
}