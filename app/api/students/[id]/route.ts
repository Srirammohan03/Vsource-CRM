// app/api/students/[id]/route.ts

import { NextRequest } from "next/server";

import  db  from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const student = await db.student.findUnique({
      where: {
        id,
      },

      include: {
        lead: {
          select: {
            id: true,
            leadNumber: true,
            studentName: true,
            emailId: true,
            mobileNumber: true,
            preferredCountry: true,
            preferredIntake: true,
            status: true,
            createdAt: true,
          },
        },

        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        counselor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        applications: {
          orderBy: {
            createdAt: "desc",
          },
        },

        visaProfile: true,

        loan: true,

        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },

        remarks: {
          orderBy: {
            createdAt: "desc",
          },
        },

        timeline: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return ok(
      student,
      "Student details fetched successfully"
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
    req: NextRequest,
    { params }: RouteContext
  ) {
    try {
      const { id } = await params;
  
      const body = await req.json();
  
      const student = await db.student.update({
        where: { id },
  
        data: {
          studentName: body.studentName,
          mobileNumber: body.mobileNumber,
          emailId: body.emailId,
          passportNumber: body.passportNumber,
          country: body.country,
          intake: body.intake,
          applicationType: body.applicationType,
          englishRequirement: body.englishRequirement,
          currentStage: body.currentStage,
          counselorId: body.counselorId,
        },
      });
  
      return ok(
        student,
        "Student updated successfully"
      );
    } catch (err) {
      return handleError(err);
    }
  }