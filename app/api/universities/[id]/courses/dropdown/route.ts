// app/api/universities/[id]/courses/route.ts

import { handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const courses = await prisma.universityCourse.findMany({
      where: {
        universityId: id,
        status: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return ok(courses, "Fetched courses successfully");
  } catch (error) {
    return handleError(error);
  }
}
