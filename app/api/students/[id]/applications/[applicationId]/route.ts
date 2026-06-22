import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      applicationId: string;
    }>;
  },
) {
  try {
    const { applicationId } = await params;

    const body = await req.json();

    const application = await prisma.studentApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        portal: body.portal,
        universityName: body.universityName,
        courseName: body.courseName,
        applicationDate: body.applicationDate
          ? new Date(body.applicationDate)
          : null,
        status: body.status,
      },
    });

    return ok(application, "Application updated successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      applicationId: string;
    }>;
  },
) {
  try {
    const { applicationId } = await params;

    await prisma.studentApplication.delete({
      where: {
        id: applicationId,
      },
    });

    return ok(null, "Application deleted successfully");
  } catch (error) {
    return handleError(error);
  }
}
