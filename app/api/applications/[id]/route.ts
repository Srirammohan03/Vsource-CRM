import { NextRequest } from "next/server";

import  db  from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const application =
      await db.studentApplication.update({
        where: { id },

        data: {
          portal: body.portal,
          universityName:
            body.universityName,
          courseName:
            body.courseName,
          applicationDate:
            body.applicationDate,
          status: body.status,
        },
      });

    return ok(
      application,
      "Application updated successfully"
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: RouteContext
  ) {
    try {
      const { id } = await params;
  
      await db.studentApplication.delete({
        where: { id },
      });
  
      return ok(
        null,
        "Application deleted successfully"
      );
    } catch (err) {
      return handleError(err);
    }
  }