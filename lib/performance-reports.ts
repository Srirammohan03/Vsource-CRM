import type { Prisma } from "@/generated/prisma/client";
import db from "@/lib/prisma";
import type {
  PerformanceApplicationExportRow,
  PerformanceReportBranchPoint,
  PerformanceReportCountryPoint,
  PerformanceReportData,
  PerformanceReportFilters,
  PerformanceReportFilterOptions,
  PerformanceReportMonthlyPoint,
  PerformanceReportRow,
  PerformanceReportSourcePoint,
  PerformanceReportStatusPoint,
  ReportDatePreset,
  ReportRecordScope,
} from "@/types/performance-report";

const performanceLeadSelect = {
  id: true,
  leadNumber: true,
  studentName: true,
  mobileNumber: true,
  emailId: true,
  source: true,
  branchId: true,
  isConverted: true,
  convertedAt: true,
  preferredCountry: true,
  preferredIntake: true,
  preferredCourse: true,
  status: true,
  nextFollowup: true,
  createdAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  counselors: {
    orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
    select: {
      counselorId: true,
      isPrimary: true,
      counselor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  student: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.LeadSelect;

const performanceStudentSelect = {
  id: true,
  leadId: true,
  branchId: true,
  counselorId: true,
  studentName: true,
  mobileNumber: true,
  emailId: true,
  currentStage: true,
  status: true,
  createdAt: true,
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
  lead: {
    select: {
      id: true,
      leadNumber: true,
      source: true,
      preferredCountry: true,
      preferredIntake: true,
      preferredCourse: true,
      status: true,
      convertedAt: true,
      nextFollowup: true,
      createdAt: true,
    },
  },
  visaLoanProfile: {
    select: {
      depositStatus: true,
      ihsPaidStatus: true,
      visaPaidStatus: true,
      casStatus: true,
      visaStatus: true,
      fintechAssigneeId: true,
      nbfc: true,
      loanStatus: true,
      pfStatus: true,
      appliedAmount: true,
      sanctionedAmount: true,
      disbursed: true,
      disbursedAmount: true,
      fintechAssignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.StudentSelect;

const performanceApplicationSelect = {
  id: true,
  studentId: true,
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
  createdAt: true,
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
} satisfies Prisma.StudentApplicationSelect;

type PerformanceLeadRecord = Prisma.LeadGetPayload<{
  select: typeof performanceLeadSelect;
}>;

type PerformanceStudentRecord = Prisma.StudentGetPayload<{
  select: typeof performanceStudentSelect;
}>;

type PerformanceApplicationRecord = Prisma.StudentApplicationGetPayload<{
  select: typeof performanceApplicationSelect;
}>;

type DateRange = {
  gte?: Date;
  lt?: Date;
};

type FilterLookup = {
  countryName: string;
  intakeName: string;
};

type BranchAccumulator = {
  branchId: string;
  branch: string;
  leads: number;
  students: number;
  applications: number;
  visaApproved: number;
  sanctionedAmount: number;
  disbursedAmount: number;
};

const STUDY_ABROAD_LEAD_TYPE = "study_abroad";
const CONVERTED_LEAD_STATUS = "converted";

function clean(value: string | null): string {
  return value?.trim() ?? "";
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  maximum: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

function getIndiaCalendarDate(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfQuarter(date: Date): Date {
  const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3;

  return new Date(Date.UTC(date.getUTCFullYear(), quarterStartMonth, 1));
}

function parseDateOnly(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateRange(
  preset: ReportDatePreset,
  customStartDate: string,
  customEndDate: string,
  now = new Date(),
): DateRange | null {
  const today = getIndiaCalendarDate(now);

  switch (preset) {
    case "today":
      return {
        gte: today,
        lt: addDays(today, 1),
      };

    case "yesterday": {
      const yesterday = addDays(today, -1);

      return {
        gte: yesterday,
        lt: today,
      };
    }

    case "last_7_days":
      return {
        gte: addDays(today, -6),
        lt: addDays(today, 1),
      };

    case "last_30_days":
      return {
        gte: addDays(today, -29),
        lt: addDays(today, 1),
      };

    case "this_month":
      return {
        gte: startOfMonth(today),
        lt: addDays(today, 1),
      };

    case "last_month": {
      const thisMonth = startOfMonth(today);
      const lastMonth = new Date(
        Date.UTC(
          thisMonth.getUTCFullYear(),
          thisMonth.getUTCMonth() - 1,
          1,
        ),
      );

      return {
        gte: lastMonth,
        lt: thisMonth,
      };
    }

    case "this_quarter":
      return {
        gte: startOfQuarter(today),
        lt: addDays(today, 1),
      };

    case "last_quarter": {
      const thisQuarter = startOfQuarter(today);
      const lastQuarter = new Date(
        Date.UTC(
          thisQuarter.getUTCFullYear(),
          thisQuarter.getUTCMonth() - 3,
          1,
        ),
      );

      return {
        gte: lastQuarter,
        lt: thisQuarter,
      };
    }

    case "this_year":
      return {
        gte: new Date(Date.UTC(today.getUTCFullYear(), 0, 1)),
        lt: addDays(today, 1),
      };

    case "custom": {
      const start = parseDateOnly(customStartDate);
      const end = parseDateOnly(customEndDate);

      if (!start && !end) {
        return null;
      }

      return {
        ...(start && { gte: start }),
        ...(end && { lt: addDays(end, 1) }),
      };
    }

    default:
      return null;
  }
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeStatus(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/[\s-]+/g, "_") ?? "";
}

function humanizeStatus(value: string): string {
  if (!value) {
    return "Not Set";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isOfferStatus(value: string): boolean {
  const normalized = normalizeStatus(value);

  if (!normalized) {
    return false;
  }

  return ![
    "none",
    "not_received",
    "pending",
    "rejected",
    "not_applicable",
  ].includes(normalized);
}

function isVisaApproved(value: string): boolean {
  const normalized = normalizeStatus(value);

  return ["approved", "visa_approved", "granted"].includes(normalized);
}

function isCasReceived(value: string): boolean {
  const normalized = normalizeStatus(value);

  return ["received", "cas_received", "issued"].includes(normalized);
}

function isLoanSanctioned(value: string): boolean {
  const normalized = normalizeStatus(value);

  return [
    "sanctioned",
    "approved",
    "disbursed",
    "partially_disbursed",
    "fully_disbursed",
  ].includes(normalized);
}

function getPrimaryLeadCounselor(lead: PerformanceLeadRecord) {
  return (
    lead.counselors.find((assignment) => assignment.isPrimary) ??
    lead.counselors[0] ??
    null
  );
}

function getApplicationCountry(application: PerformanceApplicationRecord) {
  return application.countryName ?? application.country?.name ?? "Not Set";
}

function getApplicationUniversity(application: PerformanceApplicationRecord) {
  return (
    application.universityName ?? application.university?.name ?? "Not Set"
  );
}

function getApplicationCourse(application: PerformanceApplicationRecord) {
  return application.courseName ?? application.course?.name ?? "Not Set";
}

function getApplicationIntake(application: PerformanceApplicationRecord) {
  return application.intakeName ?? application.intake?.name ?? "Not Set";
}

function sortApplicationsByDate(
  applications: PerformanceApplicationRecord[],
): PerformanceApplicationRecord[] {
  return [...applications].sort((a, b) => {
    const aDate = (a.applicationDate ?? a.createdAt).getTime();
    const bDate = (b.applicationDate ?? b.createdAt).getTime();

    return bDate - aDate;
  });
}

function groupApplicationsByStudent(
  applications: PerformanceApplicationRecord[],
): Map<string, PerformanceApplicationRecord[]> {
  const map = new Map<string, PerformanceApplicationRecord[]>();

  for (const application of applications) {
    const current = map.get(application.studentId) ?? [];
    current.push(application);
    map.set(application.studentId, current);
  }

  for (const [studentId, studentApplications] of map.entries()) {
    map.set(studentId, sortApplicationsByDate(studentApplications));
  }

  return map;
}

function mapLeadToRow(lead: PerformanceLeadRecord): PerformanceReportRow {
  const counselorAssignment = getPrimaryLeadCounselor(lead);

  return {
    recordType: "lead",
    recordId: lead.id,
    leadId: lead.id,
    leadNumber: lead.leadNumber,
    studentId: null,
    studentName: lead.studentName ?? "Not Set",
    emailId: lead.emailId ?? "",
    mobileNumber: lead.mobileNumber ?? "",
    branchId: lead.branchId,
    branchName: lead.branch?.name ?? "Not Assigned",
    counselorId: counselorAssignment?.counselorId ?? null,
    counselorName:
      counselorAssignment?.counselor?.name ?? "Not Assigned",
    source: lead.source ?? "Not Set",
    countryName: lead.preferredCountry ?? "Not Set",
    intakeName: lead.preferredIntake ?? "Not Set",
    courseName: lead.preferredCourse ?? "Not Set",
    lifecycleStatus: String(lead.status ?? ""),
    currentStage: "lead",
    createdAt: lead.createdAt.toISOString(),
    convertedAt: lead.convertedAt?.toISOString() ?? null,
    nextFollowup: lead.nextFollowup?.toISOString() ?? null,
    applicationsCount: 0,
    latestApplicationId: null,
    latestUniversityName: "Not Applied",
    latestApplicationDate: null,
    latestApplicationStatus: "",
    latestOfferStatus: "",
    casStatus: "",
    visaStatus: "",
    loanStatus: "",
    nbfc: "",
    fintechAssigneeName: "Not Assigned",
    sanctionedAmount: 0,
    disbursedAmount: 0,
  };
}

function mapStudentToRow(
  student: PerformanceStudentRecord,
  studentApplications: PerformanceApplicationRecord[],
): PerformanceReportRow {
  const latestApplication = studentApplications[0] ?? null;
  const profile = student.visaLoanProfile;

  return {
    recordType: "student",
    recordId: student.id,
    leadId: student.leadId,
    leadNumber: student.lead.leadNumber,
    studentId: student.id,
    studentName: student.studentName,
    emailId: student.emailId,
    mobileNumber: student.mobileNumber,
    branchId: student.branchId,
    branchName: student.branch?.name ?? "Not Assigned",
    counselorId: student.counselorId,
    counselorName: student.counselor?.name ?? "Not Assigned",
    source: student.lead.source ?? "Not Set",
    countryName: latestApplication
      ? getApplicationCountry(latestApplication)
      : student.lead.preferredCountry ?? "Not Set",
    intakeName: latestApplication
      ? getApplicationIntake(latestApplication)
      : student.lead.preferredIntake ?? "Not Set",
    courseName: latestApplication
      ? getApplicationCourse(latestApplication)
      : student.lead.preferredCourse ?? "Not Set",
    lifecycleStatus: String(student.status ?? ""),
    currentStage: String(student.currentStage ?? ""),
    createdAt: student.createdAt.toISOString(),
    convertedAt:
      student.lead.convertedAt?.toISOString() ?? student.createdAt.toISOString(),
    nextFollowup: student.lead.nextFollowup?.toISOString() ?? null,
    applicationsCount: studentApplications.length,
    latestApplicationId: latestApplication?.id ?? null,
    latestUniversityName: latestApplication
      ? getApplicationUniversity(latestApplication)
      : "Not Applied",
    latestApplicationDate:
      latestApplication?.applicationDate?.toISOString() ?? null,
    latestApplicationStatus: latestApplication
      ? String(latestApplication.status ?? "")
      : "",
    latestOfferStatus: latestApplication
      ? String(latestApplication.offerStatus ?? "")
      : "",
    casStatus: profile?.casStatus ?? "",
    visaStatus: profile?.visaStatus ?? "",
    loanStatus: profile?.loanStatus ?? "",
    nbfc: profile?.nbfc ?? "",
    fintechAssigneeName:
      profile?.fintechAssignee?.name ?? "Not Assigned",
    sanctionedAmount: toNumber(profile?.sanctionedAmount),
    disbursedAmount: toNumber(profile?.disbursedAmount),
  };
}

function mapApplicationToExportRow(
  application: PerformanceApplicationRecord,
  student: PerformanceStudentRecord,
): PerformanceApplicationExportRow {
  const profile = student.visaLoanProfile;

  return {
    applicationId: application.id,
    studentId: student.id,
    leadNumber: student.lead.leadNumber,
    studentName: student.studentName,
    emailId: student.emailId,
    mobileNumber: student.mobileNumber,
    branchName: student.branch?.name ?? "Not Assigned",
    counselorName: student.counselor?.name ?? "Not Assigned",
    source: student.lead.source ?? "Not Set",
    countryName: getApplicationCountry(application),
    universityName: getApplicationUniversity(application),
    courseName: getApplicationCourse(application),
    intakeName: getApplicationIntake(application),
    portal: application.portal ?? "",
    applicationDate: application.applicationDate?.toISOString() ?? null,
    applicationStatus: String(application.status ?? ""),
    offerStatus: String(application.offerStatus ?? ""),
    depositStatus: profile?.depositStatus ?? "",
    ihsPaidStatus: profile?.ihsPaidStatus ?? "",
    visaPaidStatus: profile?.visaPaidStatus ?? "",
    casStatus: profile?.casStatus ?? "",
    visaStatus: profile?.visaStatus ?? "",
    fintechAssigneeName:
      profile?.fintechAssignee?.name ?? "Not Assigned",
    nbfc: profile?.nbfc ?? "",
    loanStatus: profile?.loanStatus ?? "",
    pfStatus: profile?.pfStatus ?? "",
    appliedAmount: toNumber(profile?.appliedAmount),
    sanctionedAmount: toNumber(profile?.sanctionedAmount),
    disbursed: profile?.disbursed ?? false,
    disbursedAmount: toNumber(profile?.disbursedAmount),
  };
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  });
}

function buildMonthlyVolume(
  leads: PerformanceLeadRecord[],
  students: PerformanceStudentRecord[],
  applications: PerformanceApplicationRecord[],
): PerformanceReportMonthlyPoint[] {
  const map = new Map<string, PerformanceReportMonthlyPoint>();

  const ensurePoint = (date: Date) => {
    const key = monthKey(date);
    const current = map.get(key) ?? {
      key,
      label: monthLabel(date),
      leads: 0,
      students: 0,
      applications: 0,
    };

    map.set(key, current);
    return current;
  };

  for (const lead of leads) {
    ensurePoint(lead.createdAt).leads += 1;
  }

  for (const student of students) {
    const conversionDate = student.lead.convertedAt ?? student.createdAt;
    ensurePoint(conversionDate).students += 1;
  }

  for (const application of applications) {
    const applicationDate = application.applicationDate ?? application.createdAt;
    ensurePoint(applicationDate).applications += 1;
  }

  return Array.from(map.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-12);
}

function buildCountryDemand(
  leads: PerformanceLeadRecord[],
  students: PerformanceStudentRecord[],
  applicationsByStudent: Map<string, PerformanceApplicationRecord[]>,
): PerformanceReportCountryPoint[] {
  const map = new Map<
    string,
    {
      leads: number;
      studentIds: Set<string>;
      applications: number;
    }
  >();

  const ensureCountry = (country: string) => {
    const key = country || "Not Set";
    const current = map.get(key) ?? {
      leads: 0,
      studentIds: new Set<string>(),
      applications: 0,
    };

    map.set(key, current);
    return current;
  };

  for (const lead of leads) {
    ensureCountry(lead.preferredCountry ?? "Not Set").leads += 1;
  }

  for (const student of students) {
    const studentApplications = applicationsByStudent.get(student.id) ?? [];

    if (studentApplications.length === 0) {
      ensureCountry(student.lead.preferredCountry ?? "Not Set").studentIds.add(
        student.id,
      );
      continue;
    }

    for (const application of studentApplications) {
      const current = ensureCountry(getApplicationCountry(application));
      current.studentIds.add(student.id);
      current.applications += 1;
    }
  }

  return Array.from(map.entries())
    .map(([country, value]) => ({
      country,
      leads: value.leads,
      students: value.studentIds.size,
      applications: value.applications,
    }))
    .sort(
      (a, b) =>
        b.leads + b.students + b.applications -
        (a.leads + a.students + a.applications),
    );
}

function buildLeadStatusBreakdown(
  leads: PerformanceLeadRecord[],
  students: PerformanceStudentRecord[],
): PerformanceReportStatusPoint[] {
  const map = new Map<string, number>();

  for (const lead of leads) {
    const status = humanizeStatus(String(lead.status ?? ""));
    map.set(status, (map.get(status) ?? 0) + 1);
  }

  if (students.length > 0) {
    map.set("Converted", (map.get("Converted") ?? 0) + students.length);
  }

  return Array.from(map.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

function buildLeadSourceBreakdown(
  leads: PerformanceLeadRecord[],
  students: PerformanceStudentRecord[],
): PerformanceReportSourcePoint[] {
  const map = new Map<
    string,
    {
      leads: number;
      students: number;
    }
  >();

  const ensureSource = (source: string) => {
    const key = source || "Not Set";
    const current = map.get(key) ?? {
      leads: 0,
      students: 0,
    };

    map.set(key, current);
    return current;
  };

  for (const lead of leads) {
    ensureSource(lead.source ?? "Not Set").leads += 1;
  }

  for (const student of students) {
    ensureSource(student.lead.source ?? "Not Set").students += 1;
  }

  return Array.from(map.entries())
    .map(([source, value]) => ({
      source,
      leads: value.leads,
      students: value.students,
      total: value.leads + value.students,
    }))
    .sort((a, b) => b.total - a.total);
}

function buildStatusBreakdown(
  values: string[],
): PerformanceReportStatusPoint[] {
  const map = new Map<string, number>();

  for (const value of values) {
    const status = humanizeStatus(value);
    map.set(status, (map.get(status) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

function buildBranchPerformance(
  leads: PerformanceLeadRecord[],
  students: PerformanceStudentRecord[],
  applications: PerformanceApplicationRecord[],
): PerformanceReportBranchPoint[] {
  const map = new Map<string, BranchAccumulator>();
  const studentMap = new Map(students.map((student) => [student.id, student]));

  const ensureBranch = (branchId: string, branch: string) => {
    const current = map.get(branchId) ?? {
      branchId,
      branch,
      leads: 0,
      students: 0,
      applications: 0,
      visaApproved: 0,
      sanctionedAmount: 0,
      disbursedAmount: 0,
    };

    map.set(branchId, current);
    return current;
  };

  for (const lead of leads) {
    ensureBranch(
      lead.branchId,
      lead.branch?.name ?? "Not Assigned",
    ).leads += 1;
  }

  for (const student of students) {
    const current = ensureBranch(
      student.branchId,
      student.branch?.name ?? "Not Assigned",
    );

    current.students += 1;

    if (isVisaApproved(student.visaLoanProfile?.visaStatus ?? "")) {
      current.visaApproved += 1;
    }

    current.sanctionedAmount += toNumber(
      student.visaLoanProfile?.sanctionedAmount,
    );
    current.disbursedAmount += toNumber(
      student.visaLoanProfile?.disbursedAmount,
    );
  }

  for (const application of applications) {
    const student = studentMap.get(application.studentId);

    if (!student) {
      continue;
    }

    ensureBranch(
      student.branchId,
      student.branch?.name ?? "Not Assigned",
    ).applications += 1;
  }

  return Array.from(map.values())
    .map((value) => ({
      branchId: value.branchId,
      branch: value.branch,
      leads: value.leads,
      students: value.students,
      applications: value.applications,
      conversionRate:
        value.leads + value.students === 0
          ? 0
          : Number(
              ((value.students / (value.leads + value.students)) * 100).toFixed(
                1,
              ),
            ),
      visaApproved: value.visaApproved,
      sanctionedAmount: value.sanctionedAmount,
      disbursedAmount: value.disbursedAmount,
    }))
    .sort(
      (a, b) =>
        b.leads + b.students + b.applications -
        (a.leads + a.students + a.applications),
    );
}

function buildSummary(
  leads: PerformanceLeadRecord[],
  students: PerformanceStudentRecord[],
  applications: PerformanceApplicationRecord[],
) {
  const totalPipelineRecords = leads.length + students.length;

  return {
    totalPipelineRecords,
    totalLeads: leads.length,
    totalStudents: students.length,
    totalApplications: applications.length,
    qualifiedLeads: leads.filter(
      (lead) => normalizeStatus(String(lead.status)) === "qualified",
    ).length,
    lostLeads: leads.filter(
      (lead) => normalizeStatus(String(lead.status)) === "lost",
    ).length,
    conversionRate:
      totalPipelineRecords === 0
        ? 0
        : Number(((students.length / totalPipelineRecords) * 100).toFixed(1)),
    offerApplications: applications.filter((application) =>
      isOfferStatus(String(application.offerStatus ?? "")),
    ).length,
    visaApprovedStudents: students.filter((student) =>
      isVisaApproved(student.visaLoanProfile?.visaStatus ?? ""),
    ).length,
    casReceivedStudents: students.filter((student) =>
      isCasReceived(student.visaLoanProfile?.casStatus ?? ""),
    ).length,
    loanSanctionedStudents: students.filter((student) =>
      isLoanSanctioned(student.visaLoanProfile?.loanStatus ?? ""),
    ).length,
    totalAppliedAmount: students.reduce(
      (total, student) =>
        total + toNumber(student.visaLoanProfile?.appliedAmount),
      0,
    ),
    totalSanctionedAmount: students.reduce(
      (total, student) =>
        total + toNumber(student.visaLoanProfile?.sanctionedAmount),
      0,
    ),
    totalDisbursedAmount: students.reduce(
      (total, student) =>
        total + toNumber(student.visaLoanProfile?.disbursedAmount),
      0,
    ),
  };
}

function hasApplicationFilters(filters: PerformanceReportFilters): boolean {
  return Boolean(
    filters.countryId ||
      filters.intakeId ||
      filters.universityId ||
      filters.applicationStatus,
  );
}

function hasStudentOnlyApplicationFilters(
  filters: PerformanceReportFilters,
): boolean {
  return Boolean(filters.universityId || filters.applicationStatus);
}

function hasComplianceFilters(filters: PerformanceReportFilters): boolean {
  return Boolean(
    filters.casStatus ||
      filters.visaStatus ||
      filters.loanStatus ||
      filters.nbfc ||
      filters.fintechAssigneeId,
  );
}

function shouldIncludeLeads(filters: PerformanceReportFilters): boolean {
  if (filters.recordScope === "students") {
    return false;
  }

  if (filters.leadStatus === CONVERTED_LEAD_STATUS) {
    return false;
  }

  if (
    hasStudentOnlyApplicationFilters(filters) ||
    hasComplianceFilters(filters)
  ) {
    return false;
  }

  return true;
}

function shouldIncludeStudents(filters: PerformanceReportFilters): boolean {
  if (filters.recordScope === "leads") {
    return false;
  }

  if (
    filters.leadStatus &&
    filters.leadStatus !== CONVERTED_LEAD_STATUS
  ) {
    return false;
  }

  return true;
}

function buildLeadWhere(
  filters: PerformanceReportFilters,
  lookup: FilterLookup,
): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {
    leadType:
      STUDY_ABROAD_LEAD_TYPE as Prisma.LeadWhereInput["leadType"],
    isConverted: false,
    student: {
      is: null,
    },
  };

  if (filters.search) {
    where.OR = [
      {
        leadNumber: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        studentName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        emailId: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        mobileNumber: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        preferredCountry: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        preferredCourse: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }

  if (filters.counselorId) {
    where.counselors = {
      some: {
        counselorId: filters.counselorId,
      },
    };
  }

  if (filters.leadStatus) {
    where.status =
      filters.leadStatus as Prisma.LeadWhereInput["status"];
  }

  if (filters.leadSource) {
    where.source = {
      equals: filters.leadSource,
      mode: "insensitive",
    };
  }

  if (lookup.countryName) {
    where.preferredCountry = {
      contains: lookup.countryName,
      mode: "insensitive",
    };
  }

  if (lookup.intakeName) {
    where.preferredIntake = {
      contains: lookup.intakeName,
      mode: "insensitive",
    };
  }

  const dateRange = getDateRange(
    filters.datePreset,
    filters.startDate,
    filters.endDate,
  );

  if (dateRange) {
    where.createdAt = dateRange;
  }

  return where;
}

function buildApplicationWhere(
  filters: PerformanceReportFilters,
): Prisma.StudentApplicationWhereInput {
  const where: Prisma.StudentApplicationWhereInput = {};

  if (filters.countryId) {
    where.countryId = filters.countryId;
  }

  if (filters.intakeId) {
    where.intakeId = filters.intakeId;
  }

  if (filters.universityId) {
    where.universityId = filters.universityId;
  }

  if (filters.applicationStatus) {
    where.status =
      filters.applicationStatus as Prisma.StudentApplicationWhereInput["status"];
  }

  return where;
}

function buildStudentWhere(
  filters: PerformanceReportFilters,
): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {};
  const leadWhere: Prisma.LeadWhereInput = {};
  const visaLoanWhere: Prisma.StudentVisaLoanProfileWhereInput = {};
  const applicationWhere = buildApplicationWhere(filters);

  if (filters.search) {
    where.OR = [
      {
        studentName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        emailId: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        mobileNumber: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        lead: {
          is: {
            leadNumber: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        lead: {
          is: {
            preferredCountry: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        applications: {
          some: {
            OR: [
              {
                universityName: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                courseName: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      },
    ];
  }

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }

  if (filters.counselorId) {
    where.counselorId = filters.counselorId;
  }

  if (filters.leadSource) {
    leadWhere.source = {
      equals: filters.leadSource,
      mode: "insensitive",
    };
  }

  if (filters.leadStatus === CONVERTED_LEAD_STATUS) {
    leadWhere.status =
      CONVERTED_LEAD_STATUS as Prisma.LeadWhereInput["status"];
  }

  if (Object.keys(leadWhere).length > 0) {
    where.lead = {
      is: leadWhere,
    };
  }

  if (Object.keys(applicationWhere).length > 0) {
    where.applications = {
      some: applicationWhere,
    };
  }

  if (filters.casStatus) {
    visaLoanWhere.casStatus = filters.casStatus;
  }

  if (filters.visaStatus) {
    visaLoanWhere.visaStatus = filters.visaStatus;
  }

  if (filters.loanStatus) {
    visaLoanWhere.loanStatus = filters.loanStatus;
  }

  if (filters.nbfc) {
    visaLoanWhere.nbfc = filters.nbfc;
  }

  if (filters.fintechAssigneeId) {
    visaLoanWhere.fintechAssigneeId = filters.fintechAssigneeId;
  }

  if (Object.keys(visaLoanWhere).length > 0) {
    where.visaLoanProfile = {
      is: visaLoanWhere,
    };
  }

  const dateRange = getDateRange(
    filters.datePreset,
    filters.startDate,
    filters.endDate,
  );

  if (dateRange) {
    where.createdAt = dateRange;
  }

  return where;
}

async function getFilterLookup(
  filters: PerformanceReportFilters,
): Promise<FilterLookup> {
  const [country, intake] = await Promise.all([
    filters.countryId
      ? db.country.findUnique({
          where: {
            id: filters.countryId,
          },
          select: {
            name: true,
          },
        })
      : Promise.resolve(null),
    filters.intakeId
      ? db.intake.findUnique({
          where: {
            id: filters.intakeId,
          },
          select: {
            name: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    countryName: country?.name ?? "",
    intakeName: intake?.name ?? "",
  };
}

export function parsePerformanceReportFilters(
  searchParams: URLSearchParams,
): PerformanceReportFilters {
  const allowedPresets: ReportDatePreset[] = [
    "all",
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "this_month",
    "last_month",
    "this_quarter",
    "last_quarter",
    "this_year",
    "custom",
  ];

  const allowedScopes: ReportRecordScope[] = ["all", "leads", "students"];
  const requestedPreset = clean(searchParams.get("datePreset"));
  const requestedScope = clean(searchParams.get("recordScope"));

  const datePreset = allowedPresets.includes(
    requestedPreset as ReportDatePreset,
  )
    ? (requestedPreset as ReportDatePreset)
    : "all";

  const recordScope = allowedScopes.includes(
    requestedScope as ReportRecordScope,
  )
    ? (requestedScope as ReportRecordScope)
    : "all";

  return {
    search: clean(searchParams.get("search")),
    recordScope,
    branchId: clean(searchParams.get("branchId")),
    counselorId: clean(searchParams.get("counselorId")),
    leadStatus: clean(searchParams.get("leadStatus")),
    leadSource: clean(searchParams.get("leadSource")),
    countryId: clean(searchParams.get("countryId")),
    intakeId: clean(searchParams.get("intakeId")),
    universityId: clean(searchParams.get("universityId")),
    applicationStatus: clean(searchParams.get("applicationStatus")),
    casStatus: clean(searchParams.get("casStatus")),
    visaStatus: clean(searchParams.get("visaStatus")),
    loanStatus: clean(searchParams.get("loanStatus")),
    nbfc: clean(searchParams.get("nbfc")),
    fintechAssigneeId: clean(searchParams.get("fintechAssigneeId")),
    datePreset,
    startDate: clean(searchParams.get("startDate")),
    endDate: clean(searchParams.get("endDate")),
  };
}

export function parsePerformanceReportPagination(
  searchParams: URLSearchParams,
): {
  page: number;
  limit: number;
} {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1, 100000),
    limit: parsePositiveInteger(searchParams.get("limit"), 20, 100),
  };
}

export async function getPerformanceReport(
  filters: PerformanceReportFilters,
  page: number,
  limit: number,
  includeApplicationRows = false,
): Promise<PerformanceReportData> {
  const lookup = await getFilterLookup(filters);
  const includeLeads = shouldIncludeLeads(filters);
  const includeStudents = shouldIncludeStudents(filters);

  const [leads, students] = await Promise.all([
    includeLeads
      ? db.lead.findMany({
          where: buildLeadWhere(filters, lookup),
          select: performanceLeadSelect,
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([] as PerformanceLeadRecord[]),
    includeStudents
      ? db.student.findMany({
          where: buildStudentWhere(filters),
          select: performanceStudentSelect,
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([] as PerformanceStudentRecord[]),
  ]);

  const studentIds = students.map((student) => student.id);
  const applications =
    studentIds.length === 0
      ? []
      : await db.studentApplication.findMany({
          where: {
            ...buildApplicationWhere(filters),
            studentId: {
              in: studentIds,
            },
          },
          select: performanceApplicationSelect,
          orderBy: [
            {
              applicationDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
        });

  const applicationsByStudent = groupApplicationsByStudent(applications);
  const allRows = [
    ...leads.map(mapLeadToRow),
    ...students.map((student) =>
      mapStudentToRow(
        student,
        applicationsByStudent.get(student.id) ?? [],
      ),
    ),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const rows = allRows.slice(start, start + limit);
  const studentMap = new Map(students.map((student) => [student.id, student]));

  const applicationRows = includeApplicationRows
    ? applications.flatMap((application) => {
        const student = studentMap.get(application.studentId);

        return student ? [mapApplicationToExportRow(application, student)] : [];
      })
    : undefined;

  return {
    generatedAt: new Date().toISOString(),
    summary: buildSummary(leads, students, applications),
    monthlyVolume: buildMonthlyVolume(leads, students, applications),
    countryDemand: buildCountryDemand(
      leads,
      students,
      applicationsByStudent,
    ),
    leadStatusBreakdown: buildLeadStatusBreakdown(leads, students),
    leadSourceBreakdown: buildLeadSourceBreakdown(leads, students),
    applicationStatusBreakdown: buildStatusBreakdown(
      applications.map((application) => String(application.status ?? "")),
    ),
    visaStatusBreakdown: buildStatusBreakdown(
      students.map((student) => student.visaLoanProfile?.visaStatus ?? ""),
    ),
    loanStatusBreakdown: buildStatusBreakdown(
      students.map((student) => student.visaLoanProfile?.loanStatus ?? ""),
    ),
    branchPerformance: buildBranchPerformance(
      leads,
      students,
      applications,
    ),
    rows,
    ...(applicationRows && { applicationRows }),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getPerformanceReportForExport(
  filters: PerformanceReportFilters,
): Promise<PerformanceReportData> {
  return getPerformanceReport(
    filters,
    1,
    Number.MAX_SAFE_INTEGER,
    true,
  );
}

export async function getPerformanceReportFilterOptions(): Promise<PerformanceReportFilterOptions> {
  const [
    branches,
    counselors,
    countries,
    intakes,
    universities,
    applicationStatuses,
    visaLoanProfiles,
    fintechProfiles,
    leadSourcesMaster,
    leadSourcesUsed,
  ] = await Promise.all([
    db.branch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.user.findMany({
      where: {
        role: {
          is: {
            name: "Counsellor",
          },
        },
      },
      select: {
        id: true,
        name: true,
        branches: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.country.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.intake.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.university.findMany({
      select: {
        id: true,
        name: true,
        countryId: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.studentApplication.findMany({
      distinct: ["status"],
      select: {
        status: true,
      },
      orderBy: {
        status: "asc",
      },
    }),
    db.studentVisaLoanProfile.findMany({
      select: {
        casStatus: true,
        visaStatus: true,
        loanStatus: true,
        nbfc: true,
      },
    }),
    db.studentVisaLoanProfile.findMany({
      where: {
        fintechAssigneeId: {
          not: null,
        },
      },
      distinct: ["fintechAssigneeId"],
      select: {
        fintechAssignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.leadSource.findMany({
      where: {
        status: true,
      },
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.lead.findMany({
      where: {
        source: {
          not: null,
        },
      },
      distinct: ["source"],
      select: {
        source: true,
      },
    }),
  ]);

  const uniqueSorted = (values: Array<string | null | undefined>) =>
    Array.from(
      new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));

  return {
    branches: branches.map((branch) => ({
      value: branch.id,
      label: branch.name,
    })),
    counselors: counselors.map((counselor) => ({
      value: counselor.id,
      label: counselor.name,
      branchIds: counselor.branches.map((branch) => branch.id),
    })),
    countries: countries.map((country) => ({
      value: country.id,
      label: country.name,
    })),
    intakes: intakes.map((intake) => ({
      value: intake.id,
      label: intake.name,
    })),
    universities: universities.map((university) => ({
      value: university.id,
      label: university.name,
      countryId: university.countryId,
    })),
    fintechAssignees: fintechProfiles
      .map((profile) => profile.fintechAssignee)
      .filter(
        (
          assignee,
        ): assignee is {
          id: string;
          name: string;
        } => Boolean(assignee),
      )
      .map((assignee) => ({
        value: assignee.id,
        label: assignee.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    leadStatuses: [
      "draft",
      "new",
      "contacted",
      "qualified",
      "converted",
      "lost",
    ],
    leadSources: uniqueSorted([
      ...leadSourcesMaster.map((source) => source.name),
      ...leadSourcesUsed.map((lead) => lead.source),
    ]),
    applicationStatuses: applicationStatuses.map((item) =>
      String(item.status),
    ),
    casStatuses: uniqueSorted(
      visaLoanProfiles.map((profile) => profile.casStatus),
    ),
    visaStatuses: uniqueSorted(
      visaLoanProfiles.map((profile) => profile.visaStatus),
    ),
    loanStatuses: uniqueSorted(
      visaLoanProfiles.map((profile) => profile.loanStatus),
    ),
    nbfcs: uniqueSorted(visaLoanProfiles.map((profile) => profile.nbfc)),
  };
}
