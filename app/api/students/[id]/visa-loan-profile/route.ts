// app\api\students\[id]\visa-loan-profile\route.ts

import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;

    const body = await req.json();

    const profile = await db.studentVisaLoanProfile.upsert({
      where: {
        studentId,
      },

      create: {
        studentId,

        depositDeadlineDate: body.depositDeadlineDate
          ? new Date(body.depositDeadlineDate)
          : null,

        depositStatus: body.depositStatus,

        ihsPaidStatus: body.ihsPaidStatus,

        visaPaidStatus: body.visaPaidStatus,

        casDeadlineDate: body.casDeadlineDate
          ? new Date(body.casDeadlineDate)
          : null,

        casStatus: body.casStatus,

        visaStatus: body.visaStatus,

        universityStartDate: body.universityStartDate
          ? new Date(body.universityStartDate)
          : null,

        fintechAssignee: body.fintechAssignee,

        nbfc: body.nbfc,

        loanStatus: body.loanStatus,

        pfStatus: body.pfStatus,

        appliedAmount: body.appliedAmount,

        sanctionedAmount: body.sanctionedAmount,

        disbursed: body.disbursed ?? false,

        disbursedAmount: body.disbursedAmount,
      },

      update: {
        depositDeadlineDate: body.depositDeadlineDate
          ? new Date(body.depositDeadlineDate)
          : null,

        depositStatus: body.depositStatus,

        ihsPaidStatus: body.ihsPaidStatus,

        visaPaidStatus: body.visaPaidStatus,

        casDeadlineDate: body.casDeadlineDate
          ? new Date(body.casDeadlineDate)
          : null,

        casStatus: body.casStatus,

        visaStatus: body.visaStatus,

        universityStartDate: body.universityStartDate
          ? new Date(body.universityStartDate)
          : null,

        fintechAssignee: body.fintechAssignee,

        nbfc: body.nbfc,

        loanStatus: body.loanStatus,

        pfStatus: body.pfStatus,

        appliedAmount: body.appliedAmount,

        sanctionedAmount: body.sanctionedAmount,

        disbursed: body.disbursed ?? false,

        disbursedAmount: body.disbursedAmount,
      },
    });

    return ok(profile, "Profile saved successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;

    const profile = await db.studentVisaLoanProfile.findUnique({
      where: {
        studentId,
      },
    });

    return ok(profile, "Profile fetched successfully");
  } catch (error) {
    return handleError(error);
  }
}
