// app/api/branches/[id]/counselors/route.ts

import { handleError } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const counselors = await prisma.user.findMany({
      where: {
        role: {
          name: "Counsellor",
        },
        branches: {
          some: {
            id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: counselors,
    });
  } catch (error) {
    return handleError(error);
  }
}
