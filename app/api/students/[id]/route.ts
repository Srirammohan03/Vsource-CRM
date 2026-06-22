// app\api\students\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ok } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: {
          id,
        },
        data: {
          studentName: body.studentName,
          mobileNumber: body.mobileNumber,
          emailId: body.emailId,
          passportNumber: body.passportNumber,
          country: body.country,
          intake: body.intake,
          admissionDate: body.admissionDate
            ? new Date(body.admissionDate)
            : null,
          applicationType: body.applicationType,
        },
      });

      if (body.loan) {
        await tx.studentLoan.upsert({
          where: {
            studentId: id,
          },
          create: {
            studentId: id,
            assignee: body.loan.assignee,
            nbfc: body.loan.nbfc,
            status: body.loan.status,
            pfStatus: body.loan.pfStatus,
            sanctionedAmount: body.loan.sanctionedAmount
              ? Number(
                  String(body.loan.sanctionedAmount).replace(/[^0-9.]/g, ""),
                )
              : null,
            disbursedAmount: body.loan.disbursedAmount
              ? Number(
                  String(body.loan.disbursedAmount).replace(/[^0-9.]/g, ""),
                )
              : null,
          },
          update: {
            assignee: body.loan.assignee,
            nbfc: body.loan.nbfc,
            status: body.loan.status,
            pfStatus: body.loan.pfStatus,
            sanctionedAmount: body.loan.sanctionedAmount
              ? Number(
                  String(body.loan.sanctionedAmount).replace(/[^0-9.]/g, ""),
                )
              : null,
            disbursedAmount: body.loan.disbursedAmount
              ? Number(
                  String(body.loan.disbursedAmount).replace(/[^0-9.]/g, ""),
                )
              : null,
          },
        });
      }

      if (body.visaProfile) {
        await tx.studentVisaProfile.upsert({
          where: {
            studentId: id,
          },
          create: {
            studentId: id,
            depositStatus: body.visaProfile.depositStatus,
            ihsPaymentStatus: body.visaProfile.ihsPaymentStatus,
            interviewStatus: body.visaProfile.interviewStatus,
            casStatus: body.visaProfile.casStatus,
            visaStatus: body.visaProfile.visaStatus,
          },
          update: {
            depositStatus: body.visaProfile.depositStatus,
            ihsPaymentStatus: body.visaProfile.ihsPaymentStatus,
            interviewStatus: body.visaProfile.interviewStatus,
            casStatus: body.visaProfile.casStatus,
            visaStatus: body.visaProfile.visaStatus,
          },
        });
      }

      if (body.applications && body.applications.length > 0) {
        for (const app of body.applications) {
          await tx.studentApplication.update({
            where: {
              id: app.id,
            },
            data: {
              portal: app.portal,
              universityName: app.universityName,
              courseName: app.courseName,
              applicationDate: app.applicationDate
                ? new Date(app.applicationDate)
                : null,
              status: app.status,
            },
          });
        }
      }

      return student;
    });

    return ok(result, "Students Saved successfully");
  } catch (error) {
    console.error(error);

    return handleError(error);
  }
}
