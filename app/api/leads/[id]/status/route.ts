import { NextRequest } from "next/server";
import  db  from "@/lib/prisma";
import { handleError, ok } from "@/lib/api-helpers";
import { Prisma } from "@/generated/prisma/client";

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

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
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

          await tx.student.create({
            data: {

              leadId: lead.id,

              branchId: lead.branchId,

              counselorId:
                lead.counselors.find((c: any) => c.isPrimary)
                  ?.counselorId ?? null,

              studentName: lead.studentName ?? "",

              mobileNumber: lead.mobileNumber ?? "",

              emailId: lead.emailId ?? "",
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