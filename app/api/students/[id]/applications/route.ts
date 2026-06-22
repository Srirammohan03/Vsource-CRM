import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;

    const body = await req.json();

    if (!body.universityId) {
      throw new Error("University is required");
    }

    if (!body.courseId) {
      throw new Error("Course is required");
    }

    // Validate course belongs to selected university
    const course = await prisma.universityCourse.findFirst({
      where: {
        id: body.courseId,
        universityId: body.universityId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new Error(
        "Selected course does not belong to the selected university",
      );
    }

    const application = await prisma.studentApplication.create({
      data: {
        studentId,
        portal: body.portal ?? null,
        universityId: body.universityId,
        courseId: body.courseId,
        applicationDate: body.applicationDate
          ? new Date(body.applicationDate)
          : null,
        status: body.status,
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return ok(application, "Application created successfully");
  } catch (error) {
    return handleError(error);
  }
}
