import { NextRequest } from "next/server";
import  db  from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const application =
      await db.studentApplication.create({
        data: {
          studentId: id,

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
      "Application added successfully"
    );
  } catch (err) {
    return handleError(err);
  }
}