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
import { DMSSection } from "./DMSSection";
import { StudentTable } from "./StudentTable";
import { AddEditModal } from "./AddEditModal";
import { motion, AnimatePresence } from "framer-motion";
import { useStudents } from "@/hooks/student/useStudents";
import { Applications, Remarks, StudentRecord } from "@/types/student";
import { useCreateStudentApplication } from "@/hooks/student/useCreateStudentApplication";
import { useUpdateStudentApplication } from "@/hooks/student/useUpdateStudentApplication";
import { useDeleteStudentApplication } from "@/hooks/student/useDeleteStudentApplication";
import { useCreateStudentRemark } from "@/hooks/student/useCreateStudentRemark";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { STUDENTKEY } from "@/services/student/query-key";
import { toast } from "sonner";
import {
  useCourseDropdown,
  useUniversityDropdown,
} from "@/hooks/student/applications/useUniversityDropdown";
import { StudentBasicInfoDialog } from "@/components/student/StudentBasicInfoDialog";
import { StudentVisaLoanProfileSection } from "@/components/student/StudentVisaLoanProfileForm";

const tabs = [
  {
    key: "info",
    label: "Basic Information",
    icon: User,
    color: "text-red-500",
  },
  {
    key: "documents",
    label: "Documents",
    icon: FolderOpen,
    color: "text-blue-500",
  },
  {
    key: "applications",
    label: "University Applications",
    icon: FileText,
    color: "text-emerald-500",
  },
  {
    key: "visaLoan",
    label: "Visa Process",
    icon: CreditCard,
    color: "text-amber-500",
  },
  {
    key: "remarks",
    label: "Remarks",
    icon: FileSignature,
    color: "text-rose-500",
  },
];

export default function Home() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useStudents();
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"students">("students");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<
    "info" | "documents" | "applications" | "visaLoan" | "remarks"
  >("info");

  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(
    null,
  );

  const [appLayout, setAppLayout] = useState<"cards" | "table">("cards");
  const [showAddAppForm, setShowAddAppForm] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appPortal, setAppPortal] = useState<string>("GVOC");
  const [appDate, setAppDate] = useState<string>("");
  const [appIntake, setAppIntake] = useState<string>("Sep 2026");
  const [appStatus, setAppStatus] = useState<string>("Pending");

  const [newRemarkText, setNewRemarkText] = useState<string>("");
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { data: universities, isLoading: isUniversitiesLoad } =
    useUniversityDropdown(selectedStudentId ? selectedStudentId : "");
  const { data: courses, isLoading: isCourseLoad } =
    useCourseDropdown(selectedUniversityId);

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

  const createApplicationMutation = useCreateStudentApplication();
  const updateApplicationMutation = useUpdateStudentApplication();
  const deleteApplicationMutation = useDeleteStudentApplication();
  const createRemarkMutation = useCreateStudentRemark();

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

  const filteredStudents = useMemo(() => {
    return students.filter((student: StudentRecord) => {
      if (globalSearch.trim() !== "") {
        const q = globalSearch?.toLowerCase();
        const matchesSearch =
          student?.studentName?.toLowerCase()?.includes(q) ||
          student?.emailId?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [students, globalSearch]);

  const selectedStudent = useMemo<StudentRecord | null>(() => {
    return (
      students.find((s: StudentRecord) => s.id === selectedStudentId) ?? null
    );
  }, [students, selectedStudentId]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setCurrentView("students");
    setDetailTab("info");
    setGlobalSearch("");
    setShowSearchResults(false);
  };

  const openEditModal = (student: StudentRecord) => {
    setStudentToEdit(student);
    setIsAddEditOpen(true);
  };

  const openAddModal = () => {
    setStudentToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this student's folders and case records? This is irreversible.",
      )
    ) {
      try {
        await api.delete(`/students/${id}`);
        toast.success("Student records deleted successfully.");
        queryClient.invalidateQueries({ queryKey: STUDENTKEY.all });
        if (selectedStudentId === id) setSelectedStudentId(null);
      } catch (error) {
        toast.error("Failed to delete student records.");
      }
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRemarkText.trim() || !selectedStudentId) return;

    try {
      await createRemarkMutation.mutateAsync({
        studentId: selectedStudentId,
        note: newRemarkText.trim(),
      });
      setNewRemarkText("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleTriggerAddApp = () => {
    setEditingAppId(null);
    setAppPortal("Direct");
    setAppDate("15-Jun-2026");
    setSelectedUniversityId("");
    setSelectedCourseId("");
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
    setSelectedUniversityId(app.universityId);
    setSelectedCourseId(app.courseId);
    setAppIntake("Sep 2026");
    setAppStatus(app.status);
    setShowAddAppForm(true);
  };

  const handleSaveUniversityAppForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) return;

    const applicationStatusMap = {
      Draft: "draft",
      Applied: "applied",
      Pending: "under_review",
      "Offer Received": "conditional_offer",
      "Priority Offer Received": "conditional_offer",
      "Conditional Offer": "conditional_offer",
      "Unconditional Offer": "unconditional_offer",
      Rejected: "rejected",
      Deferred: "withdrawn",
    };

    if (!selectedUniversityId) {
      toast.error("Select a university");
      return;
    }

    if (!selectedCourseId) {
      toast.error("Select a course");
      return;
    }

    const payload = {
      portal: appPortal,
      universityId: selectedUniversityId,
      courseId: selectedCourseId,
      applicationDate: appDate ? new Date(appDate).toISOString() : null,
      status:
        applicationStatusMap[appStatus as keyof typeof applicationStatusMap] ??
        "draft",
    };

    if (editingAppId) {
      await updateApplicationMutation.mutateAsync({
        applicationId: editingAppId,
        payload,
      });
    } else {
      await createApplicationMutation.mutateAsync({
        studentId: selectedStudentId,
        payload,
      });
    }

    setShowAddAppForm(false);
    setEditingAppId(null);
  };

  const handleDeleteUniversityApp = async (appId: string) => {
    if (!confirm("Delete application?")) return;
    await deleteApplicationMutation.mutateAsync(appId);
  };

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} flex min-h-screen bg-background text-foreground transition-colors duration-200`}
    >
      <div className="grow flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedStudentId && selectedStudent ? (
              <motion.div
                key="student-detail-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 hover:underline hover:scale-[1.01] transition-transform"
                >
                  ← Back
                </button>

                <div className="space-y-6">
                  {/* Horizontal Tabs */}

                  <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = detailTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setDetailTab(tab.key as any)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-3xl border shadow-xl min-h-[500px] ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    {detailTab === "info" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-3 border-inherit">
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              Basic Information
                            </h4>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setBasicInfoOpen(true)}
                              className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                            >
                              Edit Basic Info
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              label: "Student Name",
                              val: selectedStudent?.studentName,
                              icon: User,
                            },
                            {
                              label: "Assigned Counsellor",
                              val: selectedStudent?.counselor?.name ?? "-",
                              icon: Briefcase,
                            },
                            {
                              label: "Mobile Number",
                              val: selectedStudent?.mobileNumber,
                              icon: Globe2,
                            },
                            {
                              label: "Email Address",
                              val: selectedStudent?.emailId,
                              icon: FileText,
                            },
                            {
                              label: "Date Of Birth",
                              val: selectedStudent?.dob
                                ? new Date(
                                    selectedStudent.dob,
                                  ).toLocaleDateString("en-IN")
                                : "-",
                              icon: Calendar,
                            },
                            {
                              label: "Gender",
                              val: selectedStudent?.gender ?? "-",
                              icon: User,
                            },
                            {
                              label: "Application Date",
                              val: selectedStudent?.applicationDate
                                ? new Date(
                                    selectedStudent.applicationDate,
                                  ).toLocaleDateString("en-IN")
                                : "-",
                              icon: Calendar,
                            },
                            {
                              label: "Current Stage",
                              val: selectedStudent?.currentStage ?? "-",
                              icon: GraduationCap,
                            },
                            {
                              label: "Student Status",
                              val: selectedStudent?.status ?? "-",
                              icon: FileCheck2,
                            },
                            {
                              label: "Branch",
                              val: selectedStudent?.branch?.name ?? "-",
                              icon: MapPin,
                            },
                          ].map((v, i) => {
                            const ItemIcon = v.icon;

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
                                    {v.val || "-"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {detailTab === "documents" && (
                      <div className="space-y-4">
                        {selectedStudent && (
                          <DMSSection
                            studentId={selectedStudent.id}
                            studentName={selectedStudent.studentName}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </div>
                    )}

                    {detailTab === "applications" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-inherit">
                          <div className="flex items-center gap-2">
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
                              <span>Add Course </span>
                            </button>
                          </div>
                        </div>

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
                                  University
                                </label>

                                <select
                                  value={selectedUniversityId}
                                  onChange={(e) => {
                                    setSelectedUniversityId(e.target.value);
                                    setSelectedCourseId("");
                                  }}
                                  className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                                    isDarkMode
                                      ? "bg-slate-900 border-slate-800"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <option value="">Select University</option>

                                  {isUniversitiesLoad ? (
                                    <option value="option">
                                      Universities Loading...
                                    </option>
                                  ) : (
                                    universities?.map((university: any) => (
                                      <option
                                        key={university.id}
                                        value={university.id}
                                      >
                                        {university.name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                  Course
                                </label>

                                <select
                                  value={selectedCourseId}
                                  onChange={(e) =>
                                    setSelectedCourseId(e.target.value)
                                  }
                                  disabled={!selectedUniversityId}
                                  className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                                    isDarkMode
                                      ? "bg-slate-900 border-slate-800"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <option value="">Select Course</option>

                                  {isCourseLoad ? (
                                    <option value="option">
                                      Universities Loading...
                                    </option>
                                  ) : (
                                    courses?.map((course: any) => (
                                      <option key={course.id} value={course.id}>
                                        {course.name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                  Portal
                                </label>
                                <input
                                  type="text"
                                  value={appPortal}
                                  onChange={(e) => setAppPortal(e.target.value)}
                                  placeholder="e.g. GVOC / Centurus / Direct"
                                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
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
                                  type="date"
                                  value={appDate}
                                  onChange={(e) => setAppDate(e.target.value)}
                                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                  Application Status
                                </label>
                                <select
                                  value={appStatus}
                                  onChange={(e) => setAppStatus(e.target.value)}
                                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
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
                                  disabled={
                                    createApplicationMutation.isPending ||
                                    updateApplicationMutation.isPending
                                  }
                                  type="submit"
                                  className="px-4 py-1.5 bg-red-655 bg-red-600 text-white rounded-xl text-xs font-black shadow"
                                >
                                  {createApplicationMutation.isPending ||
                                  updateApplicationMutation.isPending
                                    ? "Saving..."
                                    : "Save Entry"}
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
                                      {app?.university?.name ?? "-"}
                                    </h5>
                                    <p className="text-[11px] text-slate-400 font-medium mb-4">
                                      {app.course?.name ?? "-"}
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
                                      <span className="text-slate-300">|</span>
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
                                  <th className="px-4 py-2.5">Date Applied</th>
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
                                        {app.university?.name ?? "-"}
                                      </td>
                                      <td className="px-4 py-3 text-slate-500">
                                        {app.course?.name ?? "-"}
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

                    {detailTab === "visaLoan" && (
                      <StudentVisaLoanProfileSection
                        key={selectedStudent.id}
                        studentId={selectedStudent.id}
                        isDarkMode={isDarkMode}
                      />
                    )}

                    {detailTab === "remarks" && (
                      <div className="space-y-6">
                        <form
                          onSubmit={handleAddRemark}
                          className="flex gap-2.5"
                        >
                          <input
                            type="text"
                            value={newRemarkText}
                            onChange={(e) => setNewRemarkText(e.target.value)}
                            placeholder="Type a new compliance note, advisory update..."
                            className={`flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-202"}`}
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
              </motion.div>
            ) : (
              <>
                {currentView === "students" && (
                  <motion.div
                    key="students-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 animate-fadeIn"
                  >
                    <StudentTable
                      isDarkMode={isDarkMode}
                      onSelectStudent={handleSelectStudent}
                      onEditStudent={openEditModal}
                      onDeleteStudent={handleDeleteStudent}
                    />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        isDarkMode={isDarkMode}
        studentToEdit={studentToEdit}
      />

      {selectedStudent && (
        <StudentBasicInfoDialog
          open={basicInfoOpen}
          onClose={() => setBasicInfoOpen(false)}
          student={selectedStudent}
        />
      )}
    </div>
  );
}
