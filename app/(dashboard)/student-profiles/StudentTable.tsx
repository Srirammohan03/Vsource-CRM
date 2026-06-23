"use client";

import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Shield, ShieldOff } from "lucide-react";
import { Student } from "./mockData";
import { DocumentItem } from "./DMSSection";
import { toast } from "sonner";
import { useStudents } from "@/hooks/student/useStudents";
import { StudentRecord } from "@/types/student";

export interface LocalStudent extends Student {
  password?: string;
  twelfthEnglishMoi?: string;
  pursuingGraduate?: "Pursuing" | "Graduate";
  depositDeadlineDate?: string;
  casDeadlineDate?: string;
  univStartDate?: string;
  documents: DocumentItem[];
}

interface StudentTableProps {
  isDarkMode: boolean;
  onSelectStudent: (id: string) => void;
  onEditStudent: (student: any) => void;
  onDeleteStudent: (id: string) => void;
}

export function StudentTable({
  isDarkMode,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
}: StudentTableProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const { data, isLoading, isError, error } = useStudents();

  const students = data?.data ?? [];

  const togglePassword = (studentId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Student Progress Color Logic (Mandated by Prompt Guidelines)
  const getCellColorClass = (val: string) => {
    if (!val)
      return "bg-white text-slate-800 border-slate-100 dark:bg-slate-900 dark:text-slate-205";
    const s = val.toLowerCase().trim();

    // GREEN (Deposit Paid, CAS Received, Visa Approved, Loan Sanctioned, Disbursed, Approved, Paid, Completed, Waived, Received)
    if (
      [
        "deposit paid",
        "cas received",
        "visa approved",
        "loan sanctioned",
        "disbursed",
        "file closed",
        "approved",
        "paid",
        "completed",
        "waived",
        "received",
      ].includes(s) ||
      s === "disbursed" ||
      s === "sanctioned"
    ) {
      return "bg-emerald-100 text-emerald-800 border-emerald-250 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800";
    }

    // RED (Application Rejected, Student Dropped, Visa Rejected, File Closed, Rejected, Dropped, Cancelled, Hold, Paused, Deferred)
    if (
      [
        "application rejected",
        "student dropped",
        "visa rejected",
        "rejected",
        "dropped",
        "cancelled",
        "hold",
        "paused",
        "deferred",
        "student requested hold",
      ].includes(s)
    ) {
      return "bg-rose-150 text-rose-950 border-rose-250 dark:bg-rose-955/35 dark:text-rose-300 dark:border-rose-900";
    }

    // YELLOW (University Decision Pending, CAS Under Review, Visa Decision Pending, Applied, Under Review, Decision Pending, Intake Change, Waiting for Documents)
    if (
      [
        "university decision pending",
        "cas under review",
        "visa decision pending",
        "applied",
        "under review",
        "decision pending",
        "pending",
        "waiting for documents",
        "intake change requested",
      ].includes(s) ||
      (s.includes("pending") && !s.includes("not")) ||
      s.includes("review")
    ) {
      return "bg-yellow-300 text-yellow-950 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800";
    }

    // WHITE (Application Not Submitted, CAS Not Applied, Deposit Not Paid, Draft, Draft Pending, Not Required, Not Applied)
    return "bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800";
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as any)?.response?.data?.message ??
          (error as Error)?.message ??
          "Failed to load students",
      );
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        Loading students...
      </div>
    );
  }

  const thBgClass = isDarkMode
    ? "bg-slate-950 border-slate-800 text-slate-400"
    : "bg-slate-100 border-slate-200 text-slate-500";

  return (
    <div className="space-y-4" id="student-module-master-table">
      <div className="overflow-auto max-h-[70vh] rounded-3xl border border-slate-200/85 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm relative">
        <table className="w-full text-left text-xs border-collapse relative animate-fade-in">
          {/* Header row with precise columns defined by User */}
          <thead className="text-[10px] uppercase font-black tracking-wider border-b whitespace-nowrap select-none sticky top-0 z-30">
            <tr>
              <th
                className={`px-3 py-3 text-center sticky top-0 left-0 z-[40] border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-12 ${thBgClass}`}
              >
                SNO
              </th>
              <th
                className={`px-3 py-3 sticky top-0 left-12 z-[40] border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-20 ${thBgClass}`}
              >
                STUD ID
              </th>
              <th
                className={`px-3 py-3 sticky top-0 left-32 z-[40] border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-40 min-w-[160px] ${thBgClass}`}
              >
                STUDENT NAME
              </th>
              <th className={`px-4 py-3 ${thBgClass}`}>COUNSELLOR NAME</th>
              <th className={`px-4 py-3 ${thBgClass}`}>DATE OF ADMISSION</th>
              <th className={`px-4 py-3 ${thBgClass}`}>PASSPORT NO</th>
              <th className={`px-4 py-3 ${thBgClass}`}>MOBILE NUMBER</th>
              <th className={`px-4 py-3 ${thBgClass}`}>EMAIL ID</th>
              <th className={`px-4 py-3 ${thBgClass}`}>PASSWORD</th>
              <th className={`px-4 py-3 ${thBgClass}`}>COUNTRY</th>
              <th className={`px-4 py-3 text-center ${thBgClass}`}>INTAKE</th>
              <th className={`px-4 py-3 ${thBgClass}`}>12TH ENGLISH & MOI</th>
              <th className={`px-4 py-3 min-w-[150px] ${thBgClass}`}>
                APP STATUS
              </th>
              <th className={`px-4 py-3 ${thBgClass}`}>PORTAL</th>
              <th className={`px-4 py-3 ${thBgClass}`}>APPLICATION DATE</th>
              <th className={`px-4 py-3 ${thBgClass}`}>UNIVERSITY NAME</th>
              <th className={`px-4 py-3 ${thBgClass}`}>COURSE NAME</th>
              <th className={`px-4 py-3 ${thBgClass}`}>PURSUING / GRADUATE</th>
              <th className={`px-4 py-3 ${thBgClass}`}>OFFER STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>
                DEPOSIT DEADLINE DATE
              </th>
              <th className={`px-4 py-3 ${thBgClass}`}>DEPOSIT STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>IHS&VISA PAID STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>INTERVIEW STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>CAS DEADLINE DATE</th>
              <th className={`px-4 py-3 ${thBgClass}`}>CAS STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>VISA STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>UNIV START DATE</th>
              <th className={`px-4 py-3 ${thBgClass}`}>FINTECH ASSIGNEE</th>
              <th className={`px-4 py-3 ${thBgClass}`}>NBFC</th>
              <th className={`px-4 py-3 ${thBgClass}`}>LOAN STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>PF STATUS</th>
              <th className={`px-4 py-3 ${thBgClass}`}>SANCTIONED</th>
              <th className={`px-4 py-3 ${thBgClass}`}>DISBURSED</th>
              <th className={`px-4 py-3 min-w-[185px] ${thBgClass}`}>
                REMARKS
              </th>
              <th
                className={`px-5 py-3 text-right sticky top-0 right-0 z-[40] border-l ${thBgClass}`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 whitespace-nowrap">
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={36}
                  className="text-center py-12 text-xs text-slate-400 font-bold bg-white dark:bg-slate-900"
                >
                  No registered active students found. Check filter exclusions.
                </td>
              </tr>
            ) : (
              students.map((student: StudentRecord, idx: number) => {
                const firstApp = student?.applications?.[0] ?? {
                  portal: "-",
                  applicationDate: null,
                  universityName: "-",
                  courseName: "-",
                  status: "draft",
                };

                const latestRemark = student?.remarks?.length
                  ? student.remarks[student.remarks.length - 1]?.note
                  : "No active remarks";

                return (
                  <tr
                    key={student.id}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
                  >
                    {/* 1. SNO (Sticky left-0) */}
                    <td className="px-3 py-3.5 font-bold font-mono text-center text-slate-400 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.03)] w-12">
                      {idx + 1}
                    </td>

                    {/* 2. Student unique ID (Sticky left-12) */}
                    <td className="px-3 py-3.5 font-mono text-[11px] font-black tracking-wider text-slate-500 bg-white dark:bg-slate-900 sticky left-12 z-10 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.03)] w-20">
                      {student?.studentName ?? "-"}
                    </td>

                    {/* 3. Student Name (Sticky left-32) */}
                    <td
                      className="px-4 py-3.5 font-extrabold text-[#000000] dark:text-white hover:underline cursor-pointer sticky left-32 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.03)] truncate w-40 min-w-[160px]"
                      onClick={() => onSelectStudent(student.id)}
                    >
                      {student?.studentName ?? "-"}
                    </td>

                    {/* 4. Counsellor Name */}
                    <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300">
                      {student?.counselor?.name ?? "-"}
                    </td>

                    {/* 5. Date of Admission */}
                    <td className="px-4 py-3.5 text-slate-500 font-semibold font-mono text-[11px]">
                      {student?.applicationDate
                        ? new Date(student.applicationDate).toLocaleDateString(
                            "en-GB",
                          )
                        : "-"}
                    </td>

                    {/* 7. Passport Number */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {student?.lead?.passport ?? "-"}
                    </td>

                    {/* 8. Mobile Number */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-605 dark:text-slate-400">
                      {student?.mobileNumber ?? "-"}
                    </td>

                    {/* 9. Email ID */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {student?.emailId ?? "-"}
                    </td>

                    {/* 10. Password */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {visiblePasswords[student.id]
                            ? student?.lead?.password || "Pass@2026"
                            : "••••••••"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePassword(student.id);
                          }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                        >
                          {visiblePasswords[student.id] ? (
                            <ShieldOff className="h-3 w-3" />
                          ) : (
                            <Shield className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 11. Country */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-350">
                      {student.lead?.preferredCountry}
                    </td>

                    {/* 12. Intake */}
                    <td className="px-4 py-3.5 text-center font-bold">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {student.lead?.preferredIntake}
                      </span>
                    </td>

                    {/* 13. 12th English / MOI */}
                    <td className="px-4 py-3.5 text-slate-500 font-medium">
                      {student?.lead?.twelfthPercentage || "MOI Waiver Letter"}
                    </td>

                    {/* 14. Application Status overall */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(firstApp.status)}`}
                      >
                        {firstApp.status}
                      </span>
                    </td>

                    {/* 15. Portal */}
                    <td className="px-4 py-3.5 font-mono font-bold text-[10px] text-red-650 bg-red-600/5 px-2 py-0.5 rounded">
                      {firstApp.portal}
                    </td>

                    {/* 16. Application Date */}
                    <td className="px-4 py-3.5 font-mono text-[10px] text-slate-400">
                      {firstApp?.applicationDate
                        ? new Date(firstApp.applicationDate).toLocaleDateString(
                            "en-GB",
                          )
                        : "-"}
                    </td>

                    {/* 17. University Name */}
                    <td
                      className="px-4 py-3.5 text-slate-800 dark:text-slate-205 font-bold truncate max-w-[180px]"
                      title={firstApp?.university?.name ?? "-"}
                    >
                      {firstApp?.university?.name ?? "-"}
                    </td>

                    {/* 18. Course Name */}
                    <td
                      className="px-4 py-3.5 text-slate-550 dark:text-slate-400 truncate max-w-[150px]"
                      title={firstApp?.course?.name ?? "-"}
                    >
                      {firstApp?.course?.name ?? "-"}
                    </td>

                    {/* 19. Pursuing / Graduate */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-bold font-mono">
                      {student?.lead?.bachelorsCourse || "Graduate"}
                    </td>

                    {/* 20. Offer Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(firstApp.status)}`}
                      >
                        {firstApp.status}
                      </span>
                    </td>

                    {/* 21. Deposit Deadline Date */}
                    <td className="px-4 py-3.5 font-semibold text-slate-500 font-mono text-[11px]">
                      {student?.visaProfile?.depositDeadlineDate
                        ? new Date(
                            student.visaProfile.depositDeadlineDate,
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    {/* 22. Deposit Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student?.visaProfile?.depositStatus ?? "-")}`}
                      >
                        {student?.visaProfile?.depositStatus ?? "-"}
                      </span>
                    </td>

                    {/* 23. IHS & Visa Paid Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student.visaProfile?.ihsPaymentStatus ?? "-")}`}
                      >
                        {student.visaProfile?.ihsPaymentStatus ?? "-"}
                      </span>
                    </td>

                    {/* 24. Interview Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student?.visaProfile?.interviewStatus ?? "-")}`}
                      >
                        {student?.visaProfile?.interviewStatus ?? "-"}
                      </span>
                    </td>

                    {/* 25. CAS Deadline Date */}
                    <td className="px-4 py-3.5 font-semibold text-slate-500 font-mono text-[11px]">
                      {student?.visaProfile?.casDeadlineDate
                        ? new Date(
                            student.visaProfile.casDeadlineDate,
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    {/* 26. CAS Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student?.visaProfile?.casStatus ?? "-")}`}
                      >
                        {student?.visaProfile?.casStatus}
                      </span>
                    </td>

                    {/* 27. Visa Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student?.visaProfile?.visaStatus ?? "-")}`}
                      >
                        {student?.visaProfile?.visaStatus}
                      </span>
                    </td>

                    {/* 28. Univ Start Date */}
                    <td className="px-4 py-3.5 font-semibold text-slate-500 font-mono text-[11px]">
                      {student?.visaProfile?.universityStartDate
                        ? new Date(
                            student.visaProfile.universityStartDate,
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    {/* 29. Fintech Assignee */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium font-mono text-[11px]">
                      {student?.loan?.assignee}
                    </td>

                    {/* 30. NBFC */}
                    <td className="px-4 py-3.5 text-slate-605 dark:text-slate-300 font-bold">
                      {student.loan?.nbfc}
                    </td>

                    {/* 31. Loan Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student.loan?.status ?? "-")}`}
                      >
                        {student.loan?.status}
                      </span>
                    </td>

                    {/* 32. PF Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getCellColorClass(student?.loan?.pfStatus ?? "Pending")}`}
                      >
                        {student.loan?.pfStatus || "Pending"}
                      </span>
                    </td>

                    {/* 33. Sanctioned */}
                    <td className="px-4 py-3.5 font-black text-slate-805 dark:text-slate-300 font-mono">
                      {student.loan?.sanctionedAmount}
                    </td>

                    {/* 34. Disbursed */}
                    <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                      {student.loan?.disbursedAmount}
                    </td>

                    {/* 35. Remarks timeline note */}
                    <td
                      className="px-4 py-3.5 text-[11px] text-slate-500 max-w-[200px] truncate"
                      title={latestRemark}
                    >
                      {latestRemark}
                    </td>

                    {/* 36. Actions sticky right */}
                    <td className="px-5 py-3.5 text-right sticky right-0 z-10 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.035)]">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                        <button
                          onClick={() => onSelectStudent(student.id)}
                          className="bg-red-600/10 text-red-650 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wide inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="View complete student folders"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Detail</span>
                        </button>

                        <button
                          onClick={() => onEditStudent(student)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg text-[10px] font-black inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="Edit Student Basic Information"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-500 px-2 py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                          title="Delete Case File"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
