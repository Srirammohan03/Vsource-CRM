"use client";

import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FolderOpen,
  GraduationCap,
  Landmark,
  Loader2,
  Paperclip,
  Search,
  ShieldCheck,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useMemo,
  useState,
} from "react";

import type {
  DocumentCategory,
  DocumentChecklistItem,
  DocumentModule,
  StudentDocumentItem,
} from "@/types/student";
import { useDocuments } from "@/hooks/student/documents/useDocument";
import { useUploadStudentDocument } from "@/hooks/student/documents/useUploadStudentDocument";

export type DocumentItem = StudentDocumentItem;

interface DMSSectionProps {
  studentId: string;
  studentName: string;
  isDarkMode?: boolean;
}

type StatusFilter = "all" | "complete" | "pending";
type ModuleFilter = "ALL" | DocumentModule;

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";

const MODULE_LABELS: Record<DocumentModule, string> = {
  ADMISSION: "Admission",
  LOAN: "Finance & Loan",
  VISA: "Visa",
};

const CATEGORY_META: Record<
  DocumentCategory,
  {
    label: string;
    icon: typeof FileText;
    order: number;
  }
> = {
  PERSONAL: {
    label: "Personal Documents",
    icon: User,
    order: 1,
  },
  ACADEMIC: {
    label: "Academic Documents",
    icon: GraduationCap,
    order: 2,
  },
  TEST_SCORE: {
    label: "Test Scores",
    icon: FileText,
    order: 3,
  },
  APPLICATION: {
    label: "Application Documents",
    icon: Briefcase,
    order: 4,
  },
  UNIVERSITY: {
    label: "University Documents",
    icon: FolderOpen,
    order: 5,
  },
  LOAN_STUDENT: {
    label: "Student Finance Documents",
    icon: Landmark,
    order: 6,
  },
  LOAN_PARENT: {
    label: "Parent Finance Documents",
    icon: Landmark,
    order: 7,
  },
  LOAN_COLLATERAL: {
    label: "Collateral Documents",
    icon: Landmark,
    order: 8,
  },
  VISA: {
    label: "Visa Documents",
    icon: ShieldCheck,
    order: 9,
  },
};

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(date?: string | null): string {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAllowedFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  return ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx"].includes(
    extension,
  );
}

function getUploadButtonLabel(item: DocumentChecklistItem): string {
  if (item.uploadedCount === 0) {
    return "Upload document";
  }

  if (item.allowMultiple) {
    return item.isComplete ? "Add another" : "Upload next";
  }

  return "Replace file";
}

function getProgressLabel(item: DocumentChecklistItem): string {
  if (item.requiredCount <= 1) {
    return item.isComplete ? "Uploaded" : "Not uploaded";
  }

  return `${Math.min(
    item.uploadedCount,
    item.requiredCount,
  )} of ${item.requiredCount} uploaded`;
}

export function DMSSection({
  studentId,
  studentName,
  isDarkMode = false,
}: DMSSectionProps) {
  const { data, isLoading, isError, error, refetch } = useDocuments(studentId);

  const uploadMutation = useUploadStudentDocument(studentId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");

  const [uploadTarget, setUploadTarget] =
    useState<DocumentChecklistItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const checklist = data?.checklist ?? [];
  const summary = data?.summary;

  const firstUploadTarget = useMemo(() => {
    const firstMandatoryPending = checklist.find(
      (item: DocumentChecklistItem) => item.isMandatory && !item.isComplete,
    );

    if (firstMandatoryPending) {
      return firstMandatoryPending;
    }

    const firstPending = checklist.find(
      (item: DocumentChecklistItem) => !item.isComplete,
    );

    if (firstPending) {
      return firstPending;
    }

    return checklist[0] ?? null;
  }, [checklist]);

  const modules = useMemo(() => {
    const values = new Set<DocumentModule>();

    checklist.forEach((item: DocumentChecklistItem) => values.add(item.module));

    return Array.from(values);
  }, [checklist]);

  const filteredChecklist = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return checklist.filter((item: DocumentChecklistItem) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.code.toLowerCase().includes(normalizedSearch) ||
        CATEGORY_META[item.category].label
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "complete" && item.isComplete) ||
        (statusFilter === "pending" && !item.isComplete);

      const matchesModule =
        moduleFilter === "ALL" || item.module === moduleFilter;

      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [checklist, moduleFilter, search, statusFilter]);

  const groupedChecklist = useMemo(() => {
    const groups = new Map<DocumentCategory, DocumentChecklistItem[]>();

    filteredChecklist.forEach((item: any) => {
      const current = groups.get(item.category) ?? [];
      current.push(item);
      groups.set(item.category, current);
    });

    return Array.from(groups.entries()).sort(
      ([categoryA], [categoryB]) =>
        CATEGORY_META[categoryA].order - CATEGORY_META[categoryB].order,
    );
  }, [filteredChecklist]);

  const resetUploadDialog = () => {
    if (uploadMutation.isPending) return;

    setUploadTarget(null);
    setSelectedFile(null);
    setRemarks("");
    setUploadProgress(0);
    setFileError("");
    setIsDragging(false);
  };

  const openUploadDialog = (item: DocumentChecklistItem) => {
    setUploadTarget(item);
    setSelectedFile(null);
    setRemarks("");
    setUploadProgress(0);
    setFileError("");
  };

  const validateAndSetFile = (file: File) => {
    setFileError("");

    if (!isAllowedFile(file)) {
      setSelectedFile(null);
      setFileError("Select a PDF, JPG, PNG, WEBP, DOC or DOCX file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError("The selected file is larger than 15 MB.");
      return;
    }

    if (file.size <= 0) {
      setSelectedFile(null);
      setFileError("The selected file is empty.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      validateAndSetFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadTarget) return;

    if (!selectedFile) {
      setFileError("Please select a document file.");
      return;
    }

    setUploadProgress(0);

    await uploadMutation.mutateAsync({
      documentMasterId: uploadTarget.id,
      file: selectedFile,
      remarks,
      onProgress: setUploadProgress,
    });

    resetUploadDialog();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-950" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-950"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
        <AlertCircle className="mx-auto mb-3 h-9 w-9 text-rose-500" />
        <h4 className="text-sm font-black text-rose-700 dark:text-rose-300">
          Unable to load document checklist
        </h4>
        <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-300/70">
          {error instanceof Error
            ? error.message
            : "Please refresh and try again."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        isDarkMode ? "space-y-6 text-slate-100" : "space-y-6 text-slate-900"
      }
    >
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-5 text-white sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
                  Document Management System
                </span>
              </div>

              <h3 className="text-xl font-black sm:text-2xl">{studentName}</h3>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-white/80">
                Upload and track all admission, academic, financial and visa
                documents from one checklist.
              </p>
            </div>

            <div className="min-w-[230px] rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/70">
                    Overall completion
                  </p>
                  <p className="mt-1 text-3xl font-black">
                    {summary?.percentage ?? 0}%
                  </p>
                </div>

                <p className="text-right text-[11px] font-bold text-white/80">
                  {summary?.completedRequiredUploads ?? 0}
                  {" / "}
                  {summary?.totalRequiredUploads ?? 0}
                  <br />
                  files completed
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${summary?.percentage ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Checklist items
            </p>
            <p className="mt-1 text-2xl font-black">
              {summary?.totalChecklistItems ?? 0}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
              Completed
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary?.completedChecklistItems ?? 0}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">
              Pending
            </p>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
              {summary?.pendingChecklistItems ?? 0}
            </p>
          </div>
        </div>
      </section>

      {data && !data.hasUploadedDocuments && (
        <section className="rounded-3xl border border-dashed border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50 p-6 text-center shadow-sm dark:border-red-900/60 dark:from-red-950/20 dark:via-slate-900 dark:to-rose-950/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 text-red-600">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h4 className="mt-4 text-base font-black text-slate-900 dark:text-slate-100">
            No documents uploaded yet
          </h4>

          <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
            Start the student document checklist by uploading the first required
            document.
          </p>

          {firstUploadTarget ? (
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Recommended first document
              </p>

              <p className="mb-4 text-sm font-black text-slate-700 dark:text-slate-200">
                {firstUploadTarget.name}
              </p>

              <button
                type="button"
                onClick={() => openUploadDialog(firstUploadTarget)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                <UploadCloud className="h-4 w-4" />
                Upload first document
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              No document types have been configured. Please configure the
              document master checklist first.
            </div>
          )}
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search document name or category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={moduleFilter}
              onChange={(event) =>
                setModuleFilter(event.target.value as ModuleFilter)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="ALL">All modules</option>

              {modules.map((module) => (
                <option key={module} value={module}>
                  {MODULE_LABELS[module]}
                </option>
              ))}
            </select>

            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
              {(
                [
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["complete", "Completed"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-black transition ${
                    statusFilter === value
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {groupedChecklist.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h4 className="mt-3 text-sm font-black">No documents found</h4>
          <p className="mt-1 text-xs text-slate-400">
            Change the search or filter selection.
          </p>
        </section>
      ) : (
        groupedChecklist.map(([category, items]) => {
          const meta = CATEGORY_META[category];
          const CategoryIcon = meta.icon;

          return (
            <section key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-red-600/10 p-2 text-red-600">
                  <CategoryIcon className="h-4 w-4" />
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {meta.label}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {items.length} document
                    {items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      item.isComplete
                        ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/10"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                              item.isComplete
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            }`}
                          >
                            {item.isComplete ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}

                            {item.isComplete ? "Complete" : "Pending"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                              item.isMandatory
                                ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {item.isMandatory ? "Required" : "Conditional"}
                          </span>

                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            {MODULE_LABELS[item.module]}
                          </span>
                        </div>

                        <h5 className="break-words text-sm font-black leading-5">
                          {item.name}
                        </h5>

                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                          {getProgressLabel(item)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openUploadDialog(item)}
                        className="shrink-0 rounded-xl bg-red-600 px-3 py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-red-700"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <UploadCloud className="h-3.5 w-3.5" />
                          {getUploadButtonLabel(item)}
                        </span>
                      </button>
                    </div>

                    {item.documents.length === 0 ? (
                      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                        <Paperclip className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-700" />
                        <p className="mt-2 text-[11px] font-bold text-slate-400">
                          No file uploaded yet
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {item.documents.map((document, index) => (
                          <div
                            key={document.id}
                            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 shrink-0 text-red-600" />

                                  <p className="truncate text-[11px] font-black">
                                    {document.originalFileName}
                                  </p>

                                  {index === 0 && (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                      Latest
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 pl-6 text-[9px] font-semibold text-slate-400">
                                  {formatBytes(document.fileSize)}
                                  {" • "}
                                  {formatDate(document.uploadedAt)}
                                </p>

                                {document.remarks && (
                                  <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[10px] leading-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                    {document.remarks}
                                  </p>
                                )}
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5">
                                <a
                                  href={document.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-black text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:text-slate-300"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </a>

                                <a
                                  href={document.fileUrl}
                                  download={document.originalFileName}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-black text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:text-slate-300"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}

      {uploadTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-document-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              resetUploadDialog();
            }
          }}
        >
          <form
            onSubmit={handleUpload}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600">
                  Upload document
                </p>

                <h4
                  id="upload-document-title"
                  className="mt-1 text-base font-black"
                >
                  {uploadTarget.name}
                </h4>

                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  {getProgressLabel(uploadTarget)}
                </p>
              </div>

              <button
                type="button"
                onClick={resetUploadDialog}
                disabled={uploadMutation.isPending}
                className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-950 dark:hover:text-slate-200"
                aria-label="Close upload dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  isDragging
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
                }`}
              >
                <UploadCloud className="mx-auto h-9 w-9 text-red-600" />

                <p className="mt-3 text-xs font-black">
                  Drag and drop your file here
                </p>

                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                  PDF, JPG, PNG, WEBP, DOC or DOCX
                  {" • "}
                  maximum 15 MB
                </p>

                <label
                  htmlFor="student-document-file"
                  className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-black dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Browse file
                </label>

                <input
                  id="student-document-file"
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileInput}
                  className="sr-only"
                />
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <div className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                        {selectedFile.name}
                      </p>

                      <p className="text-[9px] font-semibold text-emerald-600/80 dark:text-emerald-400/70">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                    className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                    aria-label="Remove selected file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {fileError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[10px] font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {fileError}
                </div>
              )}

              <div>
                <label
                  htmlFor="student-document-remarks"
                  className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-400"
                >
                  Remarks
                </label>

                <textarea
                  id="student-document-remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Optional note about this document..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              {uploadMutation.isPending && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-black">
                    <span className="text-slate-500 dark:text-slate-300">
                      Uploading document
                    </span>
                    <span className="text-red-600">{uploadProgress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-red-600 transition-all"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={resetUploadDialog}
                disabled={uploadMutation.isPending}
                className="rounded-xl border border-slate-300 px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!selectedFile || uploadMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-[10px] font-black text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Save document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
