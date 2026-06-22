// app/api/students/route.ts

import { NextRequest } from "next/server";

import db from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";
import { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const branchId = searchParams.get("branchId");
    const counselorId = searchParams.get("counselorId");
    const country = searchParams.get("country");
    const intake = searchParams.get("intake");
    const visaStatus = searchParams.get("visaStatus");
    const loanStatus = searchParams.get("loanStatus");
    const casStatus = searchParams.get("casStatus");

    const where: Prisma.StudentWhereInput = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (counselorId) {
      where.counselorId = counselorId;
    }

    if (country) {
      where.country = country;
    }

    if (intake) {
      where.intake = intake;
    }

    if (search) {
      where.OR = [
        {
          studentName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          studentNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          passportNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          emailId: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          mobileNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (visaStatus) {
      where.visaProfile = {
        is: {
          visaStatus,
        },
      };
    }

    if (casStatus) {
      where.visaProfile = {
        is: {
          ...(where.visaProfile && "is" in where.visaProfile
            ? where.visaProfile.is
            : {}),
          casStatus,
        },
      };
    }

    if (loanStatus) {
      where.loan = {
        is: {
          status: loanStatus,
        },
      };
    }

    const students = await db.student.findMany({
      where,

      include: {
        lead: {
          select: {
            twelfthPercentage: true,
            bachelorsCourse: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },

        counselor: {
          select: {
            id: true,
            name: true,
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
          select: {
            id: true,
            studentId: true,
            documentType: true,
            fileName: true,
            fileUrl: true,
            uploadedAt: true,
            createdAt: true,
          },
          orderBy: {
            uploadedAt: "desc",
          },
        },

        remarks: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(students, "Students fetched successfully");
  } catch (err) {
    return handleError(err);
  }
}
