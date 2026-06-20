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

    const visaProfile =
      await db.studentVisaProfile.upsert({
        where: {
          studentId: id,
        },

        create: {
          studentId: id,

          depositStatus:
            body.depositStatus,

          depositDeadlineDate:
            body.depositDeadlineDate,

          ihsPaymentStatus:
            body.ihsPaymentStatus,

          interviewStatus:
            body.interviewStatus,

          casStatus:
            body.casStatus,

          casDeadlineDate:
            body.casDeadlineDate,

          visaStatus:
            body.visaStatus,

          universityStartDate:
            body.universityStartDate,
        },

        update: {
          depositStatus:
            body.depositStatus,

          depositDeadlineDate:
            body.depositDeadlineDate,

          ihsPaymentStatus:
            body.ihsPaymentStatus,

          interviewStatus:
            body.interviewStatus,

          casStatus:
            body.casStatus,

          casDeadlineDate:
            body.casDeadlineDate,

          visaStatus:
            body.visaStatus,

          universityStartDate:
            body.universityStartDate,
        },
      });

    return ok(
      visaProfile,
      "Visa profile updated successfully"
    );
  } catch (err) {
    return handleError(err);
  }
}