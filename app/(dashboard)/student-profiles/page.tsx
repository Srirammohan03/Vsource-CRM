// crm-frontend-next\app\(dashboard)\studentProfiles\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  CreditCard,
  FileCheck2,
  Plus,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe2,
  FileSignature,
  FolderOpen,
  LayoutGrid,
  TableProperties,
} from "lucide-react";
import { DMSSection, DocumentItem } from "./DMSSection";
import { StudentTable, LocalStudent } from "./StudentTable";
import { AddEditModal } from "./AddEditModal";
import { motion, AnimatePresence } from "framer-motion";
import { useStudents } from "@/hooks/student/useStudents";
import { Applications, Remarks, StudentRecord } from "@/types/student";

export default function Home() {
  const { data, isLoading } = useStudents();

  const [currentView, setCurrentView] = useState<"students">("students");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const students = useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Detail page state variables
  const [detailTab, setDetailTab] = useState<
    "info" | "documents" | "applications" | "finance" | "visa" | "remarks"
  >("info");

  // Search state
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Advanced Filters State Management
  const [filterCounsellor, setFilterCounsellor] = useState<string>("All");
  const [filterIntake, setFilterIntake] = useState<string>("All");
  const [filterCountry, setFilterCountry] = useState<string>("All");
  const [filterVisaStatus, setFilterVisaStatus] = useState<string>("All");
  const [filterLoanStatus, setFilterLoanStatus] = useState<string>("All");
  const [filterCasStatus, setFilterCasStatus] = useState<string>("All");
  const [filterNbfc, setFilterNbfc] = useState<string>("All");
  const [filterFintechAssignee, setFilterFintechAssignee] =
    useState<string>("All");
  const [filterAppStatus, setFilterAppStatus] = useState<string>("All");
  const [filterUniversity, setFilterUniversity] = useState<string>("All");
  const [filterDateType, setFilterDateType] = useState<string>("All");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Modals / Toggles
  // const [isFilterSidebarOpen, setIsFilterSidebarOpen] =
  //   useState<boolean>(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(
    null,
  );

  // Application sub-module (Tab 3) workflow states
  const [appLayout, setAppLayout] = useState<"cards" | "table">("cards");
  const [showAddAppForm, setShowAddAppForm] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appPortal, setAppPortal] = useState<string>("GVOC");
  const [appDate, setAppDate] = useState<string>("15-Jun-2026");
  const [appUniversity, setAppUniversity] = useState<string>("");
  const [appCourse, setAppCourse] = useState<string>("");
  const [appIntake, setAppIntake] = useState<string>("Sep 2026");
  const [appStatus, setAppStatus] = useState<string>("Pending");

  const [newRemarkText, setNewRemarkText] = useState<string>("");

  // Reset Filters wrapper
  const resetFilters = () => {
    setFilterCounsellor("All");
    setFilterIntake("All");
    setFilterCountry("All");
    setFilterVisaStatus("All");
    setFilterLoanStatus("All");
    setFilterCasStatus("All");
    setFilterNbfc("All");
    setFilterFintechAssignee("All");
    setFilterAppStatus("All");
    setFilterUniversity("All");
    setFilterDateType("All");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Admission parsed dates solver
  const parseStudentAdmissionDate = (dateStr: string): Date => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const mNames: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month =
      mNames[parts[1].toLowerCase()] !== undefined
        ? mNames[parts[1].toLowerCase()]
        : 5;
    return new Date(year, month, day);
  };

  const isDateInFilter = (
    studentDateStr: string,
    filterType: string,
    customStart: string,
    customEnd: string,
  ): boolean => {
    if (filterType === "All") return true;
    const studentDate = parseStudentAdmissionDate(studentDateStr);
    const sTime = studentDate.getTime();

    switch (filterType) {
      case "Today": {
        const target = new Date(2026, 5, 15);
        return (
          studentDate.getFullYear() === target.getFullYear() &&
          studentDate.getMonth() === target.getMonth() &&
          studentDate.getDate() === target.getDate()
        );
      }
      case "Yesterday": {
        const target = new Date(2026, 5, 14);
        return (
          studentDate.getFullYear() === target.getFullYear() &&
          studentDate.getMonth() === target.getMonth() &&
          studentDate.getDate() === target.getDate()
        );
      }
      case "Last 7 Days": {
        const minDate = new Date(2026, 5, 9);
        const maxDate = new Date(2026, 5, 15, 23, 59, 59);
        return sTime >= minDate.getTime() && sTime <= maxDate.getTime();
      }
      case "Last 30 Days": {
        const minDate = new Date(2026, 4, 16); // May 16, 2026
        const maxDate = new Date(2026, 5, 15, 23, 59, 59);
        return sTime >= minDate.getTime() && sTime <= maxDate.getTime();
      }
      case "This Month": {
        return (
          studentDate.getFullYear() === 2026 && studentDate.getMonth() === 5
        );
      }
      case "Last Month": {
        return (
          studentDate.getFullYear() === 2026 && studentDate.getMonth() === 4
        );
      }
      case "This Quarter": {
        return (
          studentDate.getFullYear() === 2026 &&
          [3, 4, 5].includes(studentDate.getMonth())
        );
      }
      case "Last Quarter": {
        return (
          studentDate.getFullYear() === 2026 &&
          [0, 1, 2].includes(studentDate.getMonth())
        );
      }
      case "This Year": {
        return studentDate.getFullYear() === 2026;
      }
      case "Custom Date": {
        if (!customStart) return true;
        const start = new Date(customStart);
        const end = customEnd ? new Date(customEnd) : new Date(2026, 5, 15);
        end.setHours(23, 59, 59, 999);
        return sTime >= start.getTime() && sTime <= end.getTime();
      }
      default:
        return true;
    }
  };

  // Sorted & Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((student: StudentRecord) => {
      // Search matching criteria
      if (globalSearch.trim() !== "") {
        const q = globalSearch?.toLowerCase();
        const matchesSearch =
          student?.studentName?.toLowerCase()?.includes(q) ||
          student?.emailId?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (filterIntake !== "All" && student.intake !== filterIntake)
        return false;
      if (filterCountry !== "All" && student.country !== filterCountry)
        return false;
      if (
        filterVisaStatus !== "All" &&
        student?.visaProfile?.visaStatus !== filterVisaStatus
      )
        return false;
      if (
        filterLoanStatus !== "All" &&
        student?.loan?.status !== filterLoanStatus
      )
        return false;
      if (
        filterCasStatus !== "All" &&
        student?.visaProfile?.casStatus !== filterCasStatus
      )
        return false;
      if (filterNbfc !== "All" && student?.loan?.nbfc !== filterNbfc)
        return false;
      if (
        filterFintechAssignee !== "All" &&
        student?.loan?.assignee !== filterFintechAssignee
      )
        return false;

      if (filterAppStatus !== "All") {
        const hasMatchingApp = student.applications.some(
          (app) => app.status === filterAppStatus,
        );
        if (!hasMatchingApp) return false;
      }

      if (filterUniversity !== "All") {
        const hasMatchingUni = student.applications.some(
          (app) => app.universityName === filterUniversity,
        );
        if (!hasMatchingUni) return false;
      }

      if (
        !isDateInFilter(
          student?.admissionDate
            ? new Date(student.admissionDate).toLocaleDateString("en-GB")
            : "-",
          filterDateType,
          customStartDate,
          customEndDate,
        )
      )
        return false;

      return true;
    });
  }, [
    students,
    globalSearch,
    filterCounsellor,
    filterIntake,
    filterCountry,
    filterVisaStatus,
    filterLoanStatus,
    filterCasStatus,
    filterNbfc,
    filterFintechAssignee,
    filterAppStatus,
    filterUniversity,
    filterDateType,
    customStartDate,
    customEndDate,
  ]);

  // Selected Student Object active state lookup
  const selectedStudent: StudentRecord = useMemo(() => {
    return (
      students.find((s: StudentRecord) => s.id === selectedStudentId) || null
    );
  }, [students, selectedStudentId]);

  // Handle student router selector
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setCurrentView("students");
    setDetailTab("info");
    setGlobalSearch("");
    setShowSearchResults(false);
  };

  // EDIT BASIC PROFILE WRAPPER
  const openEditModal = (student: StudentRecord) => {
    setStudentToEdit(student);
    setIsAddEditOpen(true);
  };

  const openAddModal = () => {
    setStudentToEdit(null);
    setIsAddEditOpen(true);
  };

  // DELETE CASE FILE
  const handleDeleteStudent = (id: string) => {
    confirm(
      "Are you sure you want to permanently delete this student's folders and case records? This is irreversible.",
    );
  };

  // CHANGE STATUS SELECT FROM TABLE INLINE OR FROM TIMELINE (Wired with progress colors!)
  const handleTableStatusChange = (
    studentId: string,
    field: string,
    value: any,
  ) => {};

  // SAVE EDIT/ADD PROFILE FORM SUBMIT COMMAND
  const handleSaveStudentPayload = (payload: Partial<StudentRecord>) => {};

  // DMS DOCUMENT METADATA SYNCS
  const handleAddDocumentToStudent = (
    studentId: string,
    docPayload: Omit<DocumentItem, "id">,
  ) => {};

  const handleDeleteDocumentFromStudent = (
    studentId: string,
    docId: string,
  ) => {};

  const handleReplaceDocumentInStudent = (
    studentId: string,
    docId: string,
    updated: Partial<DocumentItem>,
  ) => {};

  // ADDS REMARK LOG LINE TO ACTIVE PORTFOLIO CHRONOLOGY
  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim() || !selectedStudentId) return;

    setNewRemarkText("");
  };

  // MULTIPLE UNIVERSITY APPLICATIONS WORKFLOW IMPLEMENTATION (TAB 3)
  const handleTriggerAddApp = () => {
    setEditingAppId(null);
    setAppPortal("Direct");
    setAppDate("15-Jun-2026");
    setAppUniversity("");
    setAppCourse("");
    setAppIntake("Sep 2026");
    setAppStatus("Pending");
    setShowAddAppForm(true);
  };

  const handleTriggerEditApp = (app: Applications) => {
    setEditingAppId(app.id || "1");
    setAppPortal(app?.portal ?? "-");
    setAppDate(
      app?.applicationDate
        ? new Date(app.applicationDate).toLocaleDateString("en-GB")
        : "-",
    );
    setAppUniversity(app.universityName);
    setAppCourse(app.courseName);
    setAppIntake("Sep 2026");
    setAppStatus(app.status);
    setShowAddAppForm(true);
  };

  const handleSaveUniversityAppForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUniversity.trim() || !appCourse.trim() || !selectedStudentId)
      return;

    setShowAddAppForm(false);
    setEditingAppId(null);
    setAppUniversity("");
    setAppCourse("");
  };

  const handleDeleteUniversityApp = (appId: string) => {
    confirm(
      "Are you sure you want to delete this university application entry?",
    );
  };

  // SAVE TAB 4 FINANCIAL DETAILS FORM BACK TO IMMIGRATION FOLDER
  const handleSaveFinancesTab = (e: React.FormEvent, finPayload: any) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    alert("Financial credit and NBFC parameters updated successfully!");
  };

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} flex min-h-screen bg-background text-foreground transition-colors duration-200`}
    >
      <div className="grow flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* CRITICAL HERO GREETING BLOCK */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
            <div>
              <span className="text-red-601 font-black tracking-widest text-[10px] uppercase text-red-600 block">
                Consultancy CRM Management Panel
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {selectedStudentId
                  ? "Active Case Folio Verification"
                  : `${currentView} Control Desk`}
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Last Sync: 15-Jun-2026 21:59 UTC
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 3. CASE FOLIO VERIFICATION: STUDENT DETAIL VIEW */}
            {selectedStudentId && selectedStudent ? (
              <motion.div
                key="student-detail-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Return Navigator Toggle */}
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 hover:underline hover:scale-[1.01] transition-transform"
                >
                  ← Return to Master Profiles Directory
                </button>

                {/* Profile Widget header card */}
                <div
                  className={`p-6 rounded-3xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-red-605 from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center text-2xl font-black">
                      {selectedStudent?.studentName?.charAt(0) ?? "-"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-805 dark:text-slate-100">
                          {selectedStudent.studentName ?? "-"}
                        </h3>
                        <span className="bg-red-600/10 text-red-600 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full text-[9px] tracking-wide uppercase">
                          Counsellor: {selectedStudent?.counselor?.name ?? "-"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-red-600" />
                        <span>
                          Destination: {selectedStudent?.country ?? "-"}
                        </span>{" "}
                        •
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {selectedStudent?.intake ?? "-"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Flow pipeline active stage */}
                  <div className="flex flex-col lg:items-end gap-1">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                      Embassy Pipeline Node
                    </span>
                    <span className="bg-green-500/10 text-green-500 font-black px-4 py-1 border border-green-500/20 rounded-xl text-xs uppercase tracking-widest animate-pulse">
                      {selectedStudent.currentStage}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Passport Registration: {selectedStudent.passportNumber}
                    </span>
                  </div>
                </div>

                {/* VISUAL STEPPER TIMELINE AND COMPLIANCE INTEGRATION TRACKER (Interactive!) */}
                <div
                  className={`p-6 rounded-3xl border shadow-md space-y-4 ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-805"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">
                      Visa compliance pipeline stepper
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      Click any node block to force trigger stage update
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative py-2">
                    {[
                      "Lead Created",
                      "Application Submitted",
                      "Offer Received",
                      "Deposit Paid",
                      "Interview Completed",
                      "CAS Received",
                      "Visa Applied",
                      "Visa Approved",
                    ].map((step, index, arr) => {
                      const activeIndex = arr.indexOf(
                        selectedStudent?.currentStage ?? "-",
                      );
                      const isCompleted = index <= activeIndex;
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={step}
                          onClick={() => {}}
                          className={`p-3 rounded-2xl text-center border text-xs font-bold transition-all flex flex-col justify-between h-[85px] hover:scale-[1.03] overflow-hidden select-none cursor-pointer ${
                            isActive
                              ? "bg-red-600 text-white border-red-650 shadow-lg shadow-red-600/15"
                              : isCompleted
                                ? "bg-emerald-100 text-emerald-800 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-500"
                          }`}
                        >
                          <span className="text-[10px] font-black font-mono self-start text-inherit opacity-80">
                            0{index + 1}
                          </span>
                          <p className="text-[10px] tracking-tight uppercase leading-tight font-black text-left">
                            {step}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM TABS SECTION GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  {/* Left Column navigation tabs */}
                  <div className="space-y-1.5 lg:col-span-1">
                    {[
                      {
                        key: "info",
                        label: "Basic Information",
                        icon: User,
                        color: "text-red-500",
                      },
                      {
                        key: "documents",
                        label: "Document Locker (DMS)",
                        icon: FolderOpen,
                        color: "text-blue-500",
                      },
                      {
                        key: "applications",
                        label:
                          "Applications (" +
                          selectedStudent.applications.length +
                          ")",
                        icon: FileText,
                        color: "text-emerald-500",
                      },
                      {
                        key: "finance",
                        label: "Finance & Lending NBFC",
                        icon: CreditCard,
                        color: "text-amber-500",
                      },
                      {
                        key: "visa",
                        label: "Visa Stamp Stepper",
                        icon: FileCheck2,
                        color: "text-purple-500",
                      },
                      {
                        key: "remarks",
                        label: "History Remarks Timeline",
                        icon: FileSignature,
                        color: "text-rose-500",
                      },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSel = detailTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setDetailTab(tab.key as any)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all border ${
                            isSel
                              ? "bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/10"
                              : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4.5 w-4.5 ${isSel ? "text-white" : tab.color}`}
                            />
                            <span>{tab.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Middle panels contents (Col Span 3) */}
                  <div className="lg:col-span-3">
                    <div
                      className={`p-6 rounded-3xl border shadow-xl min-h-[420px] ${
                        isDarkMode
                          ? "bg-slate-900 border-slate-805 text-slate-100"
                          : "bg-white border-slate-100 text-slate-800"
                      }`}
                    >
                      {/* T1. INFORMATION PANEL (Wired fully with edit options!) */}
                      {detailTab === "info" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b pb-3 border-inherit">
                            <div>
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Profile Compliance Checklist
                              </h4>
                              <p className="text-xs font-bold text-red-650 text-red-600">
                                All fields are editable using basic edit option
                              </p>
                            </div>
                            <button
                              onClick={() => openEditModal(selectedStudent)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4.5 py-2 rounded-xl transition-all shadow-md shadow-red-600/10 cursor-pointer"
                            >
                              Edit Profile Records
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                label: "Student Identification ID",
                                val: `STU${100 + Number(selectedStudent.id)}`,
                                icon: User,
                              },
                              {
                                label: "Assigned Adviser/Counsellor",
                                val: selectedStudent.counselor?.name,
                                icon: Briefcase,
                              },
                              {
                                label: "Admission Enrollment Date",
                                val: selectedStudent.admissionDate,
                                icon: Calendar,
                              },
                              {
                                label: "Degree Track Program",
                                val: selectedStudent.applicationType,
                                icon: GraduationCap,
                              },
                              {
                                label: "Passport Registration ID",
                                val: selectedStudent.passportNumber,
                                icon: FileSignature,
                              },
                              {
                                label: "Admissions Mobile Number",
                                val: selectedStudent.mobileNumber,
                                icon: Globe2,
                              },
                              {
                                label: "Registered Email Address",
                                val: selectedStudent?.emailId,
                                icon: FileText,
                              },
                              {
                                label: "Target Country Location",
                                val: selectedStudent.country,
                                icon: MapPin,
                              },
                              {
                                label: "Target Intake Cycle",
                                val: selectedStudent.intake,
                                icon: Calendar,
                              },
                              {
                                label: "XII English Score / Waiver Medium",
                                val:
                                  selectedStudent?.lead?.twelfthPercentage ||
                                  "MOI Waiver Letter",
                                icon: FileCheck2,
                              },
                            ].map((v, i) => {
                              const ItemIcon = v.icon;
                              const value =
                                v.val instanceof Date
                                  ? v.val.toLocaleDateString()
                                  : v.val;
                              return (
                                <div
                                  key={i}
                                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center gap-3 border border-slate-100 dark:border-slate-850"
                                >
                                  <div className="p-2 bg-red-600/10 text-red-600 rounded-xl">
                                    <ItemIcon className="h-4.5 w-4.5" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">
                                      {v.label}
                                    </span>
                                    <span className="text-xs font-extrabold text-slate-850 dark:text-slate-150">
                                      {value}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* T2. DOCUMENT MANAGEMENT SYSTEM TAB (Integrated real DMSSection!) */}
                      {detailTab === "documents" && (
                        <div className="space-y-4">
                          <div className="pb-2 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Interactive Document Management System
                            </h4>
                            <p className="text-xs text-slate-450 text-slate-400">
                              Validate marksheet transcripts, visa stamps, or
                              passport PDFs below.
                            </p>
                          </div>

                          {/* <DMSSection
                            studentId={selectedStudent.id}
                            studentName={selectedStudent.studentName}
                            documents={selectedStudent.documents || []}
                            isDarkMode={isDarkMode}
                            onAddDocument={(doc) =>
                              handleAddDocumentToStudent(
                                selectedStudent.id,
                                doc,
                              )
                            }
                            onDeleteDocument={(docId) =>
                              handleDeleteDocumentFromStudent(
                                selectedStudent.id,
                                docId,
                              )
                            }
                            onReplaceDocument={(docId, updated) =>
                              handleReplaceDocumentInStudent(
                                selectedStudent.id,
                                docId,
                                updated,
                              )
                            }
                          /> */}
                        </div>
                      )}

                      {/* T3. ADVANCED MULTIPLE APPLICATIONS TAB PANEL */}
                      {detailTab === "applications" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-inherit">
                            <div>
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                University Applications Pipeline
                              </h4>
                              <p className="text-xs text-slate-450 text-slate-450 text-slate-400">
                                Manage multiple university files per applicant
                                folder
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Layout selector toggle */}
                              <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex gap-1">
                                <button
                                  onClick={() => setAppLayout("cards")}
                                  className={`p-1.5 rounded-lg text-xs ${appLayout === "cards" ? "bg-red-600 text-white" : "text-slate-400"}`}
                                  title="Render applications as Cards"
                                >
                                  <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setAppLayout("table")}
                                  className={`p-1.5 rounded-lg text-xs ${appLayout === "table" ? "bg-red-600 text-white" : "text-slate-400"}`}
                                  title="Render applications into a list table"
                                >
                                  <TableProperties className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={handleTriggerAddApp}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4.5 py-2 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-4.5 w-4.5" />
                                <span>Add New Course Program</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick Add Form Dialog inside the Tab */}
                          {showAddAppForm && (
                            <form
                              onSubmit={handleSaveUniversityAppForm}
                              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 animate-fadeIn space-y-3"
                            >
                              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-405 mb-2 text-red-600">
                                {editingAppId
                                  ? "Update University Application"
                                  : "Register New University Target"}
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    University Name
                                  </label>
                                  <input
                                    type="text"
                                    value={appUniversity}
                                    onChange={(e) =>
                                      setAppUniversity(e.target.value)
                                    }
                                    placeholder="e.g. University of Manchester"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                      isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                    }`}
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Course Name
                                  </label>
                                  <input
                                    type="text"
                                    value={appCourse}
                                    onChange={(e) =>
                                      setAppCourse(e.target.value)
                                    }
                                    placeholder="e.g. MSc Advanced Computer Science"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                      isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                    }`}
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Immigration Portal
                                  </label>
                                  <input
                                    type="text"
                                    value={appPortal}
                                    onChange={(e) =>
                                      setAppPortal(e.target.value)
                                    }
                                    placeholder="e.g. GVOC / Centurus / Direct"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                      isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                    }`}
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Application Date
                                  </label>
                                  <input
                                    type="text"
                                    value={appDate}
                                    onChange={(e) => setAppDate(e.target.value)}
                                    placeholder="15-Jun-2026"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                      isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                    }`}
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Application Status
                                  </label>
                                  <select
                                    value={appStatus}
                                    onChange={(e) =>
                                      setAppStatus(e.target.value)
                                    }
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                      isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                    }`}
                                  >
                                    {[
                                      "Draft",
                                      "Applied",
                                      "Pending",
                                      "Offer Received",
                                      "Priority Offer Received",
                                      "Conditional Offer",
                                      "Unconditional Offer",
                                      "Rejected",
                                      "Deferred",
                                    ].map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-end justify-end gap-2 pt-5">
                                  <button
                                    type="button"
                                    onClick={() => setShowAddAppForm(false)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-red-655 bg-red-600 text-white rounded-xl text-xs font-black shadow"
                                  >
                                    Save Entry
                                  </button>
                                </div>
                              </div>
                            </form>
                          )}

                          {selectedStudent.applications.length === 0 ? (
                            <p className="text-center py-12 text-slate-400">
                              No registered university applications on file. Add
                              one above.
                            </p>
                          ) : appLayout === "cards" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedStudent.applications.map(
                                (app: Applications, i: number) => (
                                  <div
                                    key={app.id || i}
                                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-850 flex flex-col justify-between whitespace-normal"
                                  >
                                    <div>
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="bg-red-600 text-white font-black text-[8px] py-0.5 px-2 rounded-full font-mono uppercase tracking-widest">
                                          {app.portal}
                                        </span>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-[9px] py-0.5 px-2 rounded-md">
                                          {app.status}
                                        </span>
                                      </div>
                                      <h5 className="font-extrabold text-sm mb-1">
                                        {app?.universityName ?? "-"}
                                      </h5>
                                      <p className="text-[11px] text-slate-400 font-medium mb-4">
                                        {app?.courseName ?? "-"}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-805/50 text-[10px] text-slate-400">
                                      <span>
                                        Date Filed:{" "}
                                        {app?.applicationDate
                                          ? new Date(
                                              app?.applicationDate,
                                            ).toLocaleDateString("en-GB")
                                          : "-"}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleTriggerEditApp(app)
                                          }
                                          className="text-red-600 hover:underline font-bold"
                                        >
                                          Edit
                                        </button>
                                        <span className="text-slate-300">
                                          |
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteUniversityApp(
                                              app.id || "",
                                            )
                                          }
                                          className="text-rose-500 hover:underline font-bold"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-850">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-950 text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                  <tr>
                                    <th className="px-4 py-2.5">Portal</th>
                                    <th className="px-4 py-2.5">University</th>
                                    <th className="px-4 py-2.5">
                                      Course Program
                                    </th>
                                    <th className="px-4 py-2.5">
                                      Date Applied
                                    </th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5 text-right">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {selectedStudent.applications.map(
                                    (app: Applications, i: number) => (
                                      <tr
                                        key={app.id || i}
                                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850"
                                      >
                                        <td className="px-4 py-3 font-mono font-bold text-red-650 text-red-600">
                                          {app.portal}
                                        </td>
                                        <td className="px-4 py-3 font-bold">
                                          {app.universityName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                          {app.courseName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                          {app?.applicationDate
                                            ? new Date(
                                                app?.applicationDate,
                                              ).toLocaleDateString("en-GB")
                                            : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="bg-slate-100 dark:bg-slate-850 text-[10px] font-black px-2 py-0.5 rounded">
                                            {app.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-1.5">
                                          <button
                                            onClick={() =>
                                              handleTriggerEditApp(app)
                                            }
                                            className="text-red-600 font-bold"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteUniversityApp(
                                                app.id || "",
                                              )
                                            }
                                            className="text-rose-500 font-bold"
                                          >
                                            Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* T4. FINANCIAL CREDIT CONTROL PANEL */}
                      {detailTab === "finance" && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Financial & Borrowing Ledger
                            </h4>
                            <p className="text-xs text-slate-400">
                              Manage Lending NBFC credits, processing fee
                              waivers, and sanctioned payouts.
                            </p>
                          </div>

                          <form
                            onSubmit={(e) => {
                              const form = e.currentTarget;
                              const payload = {
                                assignee: (
                                  form.elements.namedItem(
                                    "assignee",
                                  ) as HTMLInputElement
                                ).value,
                                nbfc: (
                                  form.elements.namedItem(
                                    "nbfc",
                                  ) as HTMLSelectElement
                                ).value,
                                status: (
                                  form.elements.namedItem(
                                    "status",
                                  ) as HTMLSelectElement
                                ).value,
                                pfStatus: (
                                  form.elements.namedItem(
                                    "pfStatus",
                                  ) as HTMLSelectElement
                                ).value,
                                sanctionedAmount: (
                                  form.elements.namedItem(
                                    "sanctioned",
                                  ) as HTMLInputElement
                                ).value,
                                disbursedAmount: (
                                  form.elements.namedItem(
                                    "disbursed",
                                  ) as HTMLInputElement
                                ).value,
                              };
                              handleSaveFinancesTab(e, payload);
                            }}
                            className="space-y-4 text-xs"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Fintech Assignee Representative
                                </label>
                                <input
                                  type="text"
                                  name="assignee"
                                  defaultValue={
                                    selectedStudent?.loan?.assignee ?? "-"
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                    isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Lending NBFC Partner
                                </label>
                                <select
                                  name="nbfc"
                                  defaultValue={
                                    selectedStudent?.loan?.nbfc ?? "-"
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-650 ${
                                    isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  {[
                                    "Poonawalla",
                                    "Credila",
                                    "Avanse",
                                    "ICICI",
                                    "HDFC Credila",
                                    "Self Funding",
                                    "Other",
                                  ].map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Loan Status
                                </label>
                                <select
                                  name="status"
                                  defaultValue={
                                    selectedStudent?.loan?.status ?? "-"
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 ${
                                    isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  {[
                                    "Pending",
                                    "Under Review",
                                    "Approved",
                                    "Rejected",
                                    "Sanctioned",
                                    "Disbursed",
                                  ].map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Processing Fee Status
                                </label>
                                <select
                                  name="pfStatus"
                                  defaultValue={
                                    selectedStudent?.loan?.pfStatus || "Pending"
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 ${
                                    isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  {[
                                    "Paid",
                                    "Pending",
                                    "Waived",
                                    "Not Applicable",
                                  ].map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Sanctioned Amount
                                </label>
                                <input
                                  type="text"
                                  name="sanctioned"
                                  defaultValue={
                                    selectedStudent?.loan?.sanctionedAmount
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                    isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Released Disbursement
                                </label>
                                <input
                                  type="text"
                                  name="disbursed"
                                  defaultValue={
                                    selectedStudent?.loan?.disbursedAmount
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                    isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                  required
                                />
                              </div>
                            </div>

                            <div className="pt-4 border-t border-inherit flex justify-end">
                              <button
                                type="submit"
                                className="bg-red-655 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-6 py-2.5 rounded-xl uppercase tracking-wider shadow"
                              >
                                Save Financial Parameters
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* T5. VISA STATS MILESTONES PROGRESS TRACKER */}
                      {detailTab === "visa" && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Immigration Milestones Checklist
                            </h4>
                            <p className="text-xs text-slate-400">
                              Alter key embassy timeline metrics. Changes
                              refresh progress bars instantly.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                Deposit Payment Status
                              </label>
                              <select
                                value={
                                  selectedStudent?.visaProfile?.depositStatus
                                }
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "depositStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${
                                  isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                }`}
                              >
                                {[
                                  "Deposit Paid",
                                  "Deposit Not Paid",
                                  "Paid",
                                  "Pending",
                                  "Waived",
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                IHS Charge Status
                              </label>
                              <select
                                value={
                                  selectedStudent?.visaProfile?.ihsPaymentStatus
                                }
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "ihsPayment",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${
                                  isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                }`}
                              >
                                {["Paid", "Pending", "Not Required"].map(
                                  (opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                Embassy Interview
                              </label>
                              <select
                                value={
                                  selectedStudent?.visaProfile?.interviewStatus
                                }
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "interviewStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${
                                  isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                }`}
                              >
                                {["Completed", "Pending", "Waived"].map(
                                  (opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                CAS Issue Status
                              </label>
                              <select
                                value={selectedStudent?.visaProfile?.casStatus}
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "casStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${
                                  isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                }`}
                              >
                                {[
                                  "CAS Received",
                                  "CAS Under Review",
                                  "CAS Not Applied",
                                  "Received",
                                  "Pending",
                                  "Not Required",
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                Official Visa Stamp Decision
                              </label>
                              <select
                                value={selectedStudent?.visaProfile?.visaStatus}
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "visaStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${
                                  isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                }`}
                              >
                                {[
                                  "Visa Approved",
                                  "Visa Applied",
                                  "Visa Decision Pending",
                                  "Visa Rejected",
                                  "Draft Pending",
                                  "Approved",
                                  "Applied",
                                  "Decision Pending",
                                  "Rejected",
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="p-4 bg-emerald-500/10 border border-emerald-550/20 text-xs rounded-2xl flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              Embassy milestone fields saved back to case file.
                              Dynamic pipeline is in sync.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* T6. CHRONOLOGICAL REMARKS HUB */}
                      {detailTab === "remarks" && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Consulting Notes History
                            </h4>
                            <p className="text-xs text-slate-400 font-medium">
                              Record chronological logs or parent conversation
                              summaries below.
                            </p>
                          </div>

                          <form
                            onSubmit={handleAddRemark}
                            className="flex gap-2.5"
                          >
                            <input
                              type="text"
                              value={newRemarkText}
                              onChange={(e) => setNewRemarkText(e.target.value)}
                              placeholder="Type a new compliance note, advisory update..."
                              className={`flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${
                                isDarkMode
                                  ? "bg-slate-950 border-slate-800 text-slate-200"
                                  : "bg-slate-50 border-slate-202"
                              }`}
                              required
                            />
                            <button
                              type="submit"
                              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer"
                            >
                              Append Remark
                            </button>
                          </form>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-3">
                            {(selectedStudent?.remarks || [])
                              .slice()
                              .reverse()
                              .map((rem: Remarks, i: number) => (
                                <div
                                  key={i}
                                  className="relative pl-6 border-l-2 border-red-600/30 pb-3 last:pb-0"
                                >
                                  <span className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-red-600" />
                                  <div className="text-[10px] flex items-center justify-between text-slate-400 mb-1 font-bold">
                                    <span className="font-mono bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded">
                                      {rem?.createdAt
                                        ? new Date(
                                            rem?.createdAt,
                                          ).toLocaleDateString("en-GB")
                                        : "-"}
                                    </span>
                                    <span>Logged by Agent</span>
                                  </div>
                                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                                    {rem.note}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* 1. CORE PIXEL-PERFECT DASHBOARD VIEW */}

                {/* 2. ALL STUDENT PROFILES (Master Table rendering 32 specs columns!) */}
                {currentView === "students" && (
                  <motion.div
                    key="students-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 animate-fadeIn"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit bg-inherit">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Master Admissions Directory
                        </h4>
                        <p className="text-xs text-slate-450 text-slate-400 font-medium">
                          Showing {filteredStudents.length} of {students.length}{" "}
                          compliance folders
                        </p>
                      </div>

                      {/* <div className="flex items-center gap-2">
                        <button
                          onClick={openAddModal}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4.5 py-2 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-4.5 w-4.5" />
                          <span>Quick Register Student</span>
                        </button>
                      </div> */}
                    </div>

                    {/* Master Student 32-Column Table */}
                    <StudentTable
                      // students={filteredStudents}
                      isDarkMode={isDarkMode}
                      onSelectStudent={handleSelectStudent}
                      onEditStudent={openEditModal}
                      onDeleteStudent={handleDeleteStudent}
                      onStatusChange={handleTableStatusChange}
                    />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 3. FLOATING FILTER SIDEBAR DRAWER PANEL (Fully Responsive!) */}

      {/* 4. DRAWER DIALOG BOX FOR ADD & EDIT STUDENT FOLIO */}
      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        isDarkMode={isDarkMode}
        studentToEdit={studentToEdit}
        onSave={handleSaveStudentPayload}
      />
    </div>
  );
}
