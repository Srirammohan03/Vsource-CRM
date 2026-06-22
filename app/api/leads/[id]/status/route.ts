import { NextRequest } from "next/server";
import  db  from "@/lib/prisma";
import { handleError, ok } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        counselors: {
          where: {
            isPrimary: true,
          },
        },
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    const result = await db.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: body.status,
          ...(body.status === "converted"
            ? {
                isConverted: true,
                convertedAt: new Date(),
              }
            : {}),
        },
      });

      if (body.status === "converted") {
        const existingStudent = await tx.student.findUnique({
          where: {
            leadId: lead.id,
          },
        });

        if (!existingStudent) {
          const studentCount = await tx.student.count();

          await tx.student.create({
            data: {
              studentNumber: `STU${String(
                studentCount + 1
              ).padStart(5, "0")}`,

              leadId: lead.id,

              branchId: lead.branchId,

              counselorId:
                lead.counselors.find((c) => c.isPrimary)
                  ?.counselorId ?? null,

              studentName: lead.studentName ?? "",

              mobileNumber: lead.mobileNumber,

              emailId: lead.emailId,

              passportNumber: lead.passport,

              country: lead.preferredCountry,

              intake: lead.preferredIntake,

              applicationType: lead.preferredCourse,

              admissionDate: new Date(),

              currentStage: "application_started",
            },
          });
        }
      }

      return updatedLead;
    });

    return ok(
      result,
      body.status === "converted"
        ? "Lead converted successfully"
        : "Lead status updated successfully"
    );
  } catch (err) {
    return handleError(err);
  }
}