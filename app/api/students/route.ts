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

    if (search) {
      where.OR = [
        {
          studentName: {
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

    // Visa + Loan Profile Filters
    const visaLoanProfileFilter: Prisma.StudentVisaLoanProfileWhereInput = {};

    if (visaStatus) {
      visaLoanProfileFilter.visaStatus = visaStatus;
    }

    if (casStatus) {
      visaLoanProfileFilter.casStatus = casStatus;
    }

    if (loanStatus) {
      visaLoanProfileFilter.loanStatus = loanStatus;
    }

    if (Object.keys(visaLoanProfileFilter).length > 0) {
      where.visaLoanProfile = {
        is: visaLoanProfileFilter,
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
          select: {
            id: true,

            countryId: true,
            countryName: true,

            universityId: true,
            universityName: true,

            courseId: true,
            courseName: true,

            intakeId: true,
            intakeName: true,

            portal: true,
            applicationDate: true,

            status: true,
            offerStatus: true,

            country: {
              select: {
                id: true,
                name: true,
              },
            },

            university: {
              select: {
                id: true,
                name: true,
              },
            },

            course: {
              select: {
                id: true,
                name: true,
              },
            },

            intake: {
              select: {
                id: true,
                name: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        visaLoanProfile: true,

        documents: {
          select: {
            id: true,

            studentId: true,

            documentCode: true,
            documentType: true,

            originalFileName: true,
            storedFileName: true,

            fileUrl: true,

            mimeType: true,
            fileSize: true,

            remarks: true,

            uploadedAt: true,
            createdAt: true,
            updatedAt: true,
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
