"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useDeleteStudentDocument,
  useStudentDocuments,
  useUpdateStudentDocument,
  useUploadStudentDocument,
} from "@/hooks/student/documents/useStudentDocuments";
import type {
  StudentDocumentChecklistItem,
  StudentDocumentRecord,
} from "@/types/student";

type DMSSectionProps = {
  studentId: string;
  studentName: string;
  isDarkMode?: boolean;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDate(value?: string | null) {
  if (!value) return { date: "-", time: "" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "" };

  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function isValidFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(
    extension &&
    ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx"].includes(extension),
  );
}

function getDocumentType(fileName: string) {
  return fileName.split(".").pop()?.toUpperCase() || "FILE";
}

function isOptionalItem(item: StudentDocumentChecklistItem) {
  const value = item as StudentDocumentChecklistItem & {
    isOptional?: boolean;
    required?: boolean;
  };

  return value.isOptional ?? value.required === false;
}

export function DMSSection({ studentId, studentName }: DMSSectionProps) {
  const documentsQuery = useStudentDocuments(studentId);
  const uploadMutation = useUploadStudentDocument(studentId);
  const updateMutation = useUpdateStudentDocument(studentId);
  const deleteMutation = useDeleteStudentDocument(studentId);

  const [checklistSearch, setChecklistSearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItemCode, setSelectedItemCode] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [fileError, setFileError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<StudentDocumentRecord | null>(null);

  const checklist = documentsQuery.data?.checklist ?? [];
  const summary = documentsQuery.data?.summary;

  useEffect(() => {
    if (!selectedItemCode && checklist.length > 0) {
      setSelectedItemCode(checklist[0].code);
    }
  }, [checklist, selectedItemCode]);

  const selectedItem = useMemo(
    () => checklist.find((item) => item.code === selectedItemCode) ?? null,
    [checklist, selectedItemCode],
  );

  const filteredChecklist = useMemo(() => {
    const value = checklistSearch.trim().toLowerCase();
    if (!value) return checklist;

    return checklist.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.code.toLowerCase().includes(value),
    );
  }, [checklist, checklistSearch]);

  const filteredDocuments = useMemo(() => {
    const documents = selectedItem?.documents ?? [];
    const query = documentSearch.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.originalFileName.toLowerCase().includes(query) ||
        document.documentType.toLowerCase().includes(query);
      const extension = getDocumentType(
        document.originalFileName,
      ).toLowerCase();
      const matchesType = typeFilter === "all" || extension === typeFilter;
      const matchesStatus =
        statusFilter === "all" || statusFilter === "uploaded";

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [selectedItem, documentSearch, typeFilter, statusFilter]);

  const requiredTotal = summary?.totalRequiredUploads ?? checklist.length;
  const completedTotal = summary?.completedRequiredUploads ?? 0;
  const pendingTotal = Math.max(requiredTotal - completedTotal, 0);
  const optionalTotal = checklist.filter(isOptionalItem).length;

  const clearUploadForm = () => {
    setSelectedFile(null);
    setRemarks("");
    setFileError("");
    setProgress(0);
    setEditingDocument(null);
  };

  const selectChecklistItem = (item: StudentDocumentChecklistItem) => {
    setSelectedItemCode(item.code);
    setDocumentSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    clearUploadForm();
  };

  const validateFile = (file: File) => {
    setFileError("");

    if (!isValidFile(file)) {
      setSelectedFile(null);
      setFileError("Select a PDF, JPG, PNG, WEBP, DOC or DOCX file.");
      return;
    }

    if (file.size <= 0) {
      setSelectedFile(null);
      setFileError("The selected file is empty.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError("The selected file must be 15 MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedItem) {
      setFileError("Select a checklist item first.");
      return;
    }

    if (!editingDocument && !selectedFile) {
      setFileError("Please select a document.");
      return;
    }

    setProgress(0);

    try {
      if (editingDocument) {
        await updateMutation.mutateAsync({
          documentId: editingDocument.id,
          file: selectedFile,
          remarks,
          onProgress: setProgress,
        });
      } else {
        await uploadMutation.mutateAsync({
          documentCode: selectedItem.code,
          file: selectedFile as File,
          remarks,
          onProgress: setProgress,
        });
      }

      clearUploadForm();
    } catch {
      return;
    }
  };

  const handleEdit = (document: StudentDocumentRecord) => {
    setEditingDocument(document);
    setSelectedFile(null);
    setRemarks(document.remarks || "");
    setFileError("");
    window.document.getElementById("dms-upload-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleDelete = async (document: StudentDocumentRecord) => {
    const accepted = window.confirm(
      `Delete "${document.originalFileName}" permanently?`,
    );
    if (!accepted) return;

    try {
      await deleteMutation.mutateAsync(document.id);
      if (editingDocument?.id === document.id) clearUploadForm();
    } catch {
      return;
    }
  };

  if (documentsQuery.isLoading) {
    return (
      <div className="grid min-h-[650px] grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        <div className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  if (documentsQuery.isError) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
        <div>
          <AlertCircle className="mx-auto h-9 w-9 text-rose-500" />
          <h4 className="mt-3 text-sm font-black text-rose-700 dark:text-rose-300">
            Unable to load document checklist
          </h4>
          <button
            type="button"
            onClick={() => documentsQuery.refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[710px] grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside
        className="
    sticky
    top-6
    h-[calc(100vh-120px)]
    flex
    flex-col
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-sm
    dark:border-slate-800
    dark:bg-slate-950
  "
      >
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-500/10">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">
              Documents
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              {
                label: "Total",
                value: requiredTotal,
                className: "text-slate-900 dark:text-white",
              },
              {
                label: "Completed",
                value: completedTotal,
                className: "text-emerald-600",
              },
              {
                label: "Pending",
                value: pendingTotal,
                className: "text-red-600",
              },
              {
                label: "Optional",
                value: optionalTotal,
                className: "text-slate-600 dark:text-slate-300",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`text-sm font-black ${item.className}`}>
                  {item.value}
                </div>
                <div className="mt-1 text-[9px] text-slate-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={checklistSearch}
              onChange={(event) => setChecklistSearch(event.target.value)}
              placeholder="Search checklist..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-red-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {filteredChecklist.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <FileText className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-400">
                No matching documents
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredChecklist.map((item) => {
                const isSelected = selectedItemCode === item.code;
                const uploadedCount = item.documents.length;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => selectChecklistItem(item)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20"
                        : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:hover:border-slate-800 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className={`h-4 w-4 shrink-0 ${
                          item.isComplete
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                          {item.name}
                        </div>
                        <div className="mt-1 text-[9px] text-slate-500">
                          {isOptionalItem(item) ? "Optional" : "Required"}{" "}
                          &nbsp;•&nbsp; {uploadedCount} file
                          {uploadedCount === 1 ? "" : "s"}
                        </div>
                      </div>

                      {item.isComplete ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      ) : isOptionalItem(item) ? (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                          Optional
                        </span>
                      ) : (
                        <span className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[9px] font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/20">
                          Missing
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {!selectedItem ? (
          <div className="flex min-h-[650px] items-center justify-center p-6 text-center">
            <div>
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-sm font-black">
                Select a checklist item
              </h3>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedItem.name}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                      selectedItem.isComplete
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                    }`}
                  >
                    {selectedItem.isComplete ? "Completed" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Upload required documents for {studentName}
                </p>
              </div>

              <div className="flex items-center gap-5 text-[10px] text-slate-500">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    Required: {isOptionalItem(selectedItem) ? 0 : 1} file(s)
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Uploaded: {selectedItem.documents.length} file(s)
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={documentSearch}
                    onChange={(event) => setDocumentSearch(event.target.value)}
                    placeholder="Search documents..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="doc">DOC</option>
                  <option value="docx">DOCX</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <option value="all">All Status</option>
                  <option value="uploaded">Uploaded</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setDocumentSearch("");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Clear
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 font-bold">#</th>
                        <th className="px-4 py-3 font-bold">Document Name</th>
                        <th className="px-4 py-3 font-bold">Type</th>
                        <th className="px-4 py-3 font-bold">Size</th>
                        <th className="px-4 py-3 font-bold">Remarks</th>
                        <th className="px-4 py-3 font-bold">Uploaded On</th>
                        <th className="px-4 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredDocuments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-slate-400"
                          >
                            No uploaded documents found for this checklist item.
                          </td>
                        </tr>
                      ) : (
                        filteredDocuments.map((document, index) => {
                          const uploaded = formatDate(document.uploadedAt);
                          return (
                            <tr
                              key={document.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-900/70"
                            >
                              <td className="px-4 py-4 text-slate-500">
                                {index + 1}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-500/10">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="max-w-[260px] truncate font-semibold text-slate-800 dark:text-slate-100">
                                      {document.originalFileName}
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-500">
                                      {document.documentType ||
                                        selectedItem.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                  {getDocumentType(document.originalFileName)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-slate-500">
                                {formatBytes(document.fileSize)}
                              </td>
                              <td className="px-4 py-4 text-slate-500">
                                {document.remarks}
                              </td>
                              <td className="px-4 py-4 text-slate-500">
                                <div>{uploaded.date}</div>
                                <div className="mt-0.5 text-[10px]">
                                  {uploaded.time}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/20"
                                    title="View document"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(document)}
                                    className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/20"
                                    title="Edit document"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(document)}
                                    disabled={deleteMutation.isPending}
                                    className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/20"
                                    title="Delete document"
                                  >
                                    <Trash2 className="h-4 w-4" />
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

                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-[10px] text-slate-500 dark:border-slate-800">
                  <span>
                    Showing {filteredDocuments.length === 0 ? 0 : 1} to{" "}
                    {filteredDocuments.length} of {filteredDocuments.length}{" "}
                    document{filteredDocuments.length === 1 ? "" : "s"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-800"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white">
                      1
                    </span>
                    <button
                      type="button"
                      disabled
                      className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-800"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <form
                id="dms-upload-panel"
                onSubmit={handleSubmit}
                className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
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
                  className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                    isDragging
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                    Drag & drop your file here or{" "}
                    <label
                      htmlFor="dms-document-file"
                      className="cursor-pointer text-red-600 hover:underline"
                    >
                      click to browse
                    </label>
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    PDF, JPG, PNG, WEBP, DOC, DOCX (Max 15MB)
                  </p>
                  <input
                    id="dms-document-file"
                    type="file"
                    accept={ACCEPTED_TYPES}
                    onChange={handleFileInput}
                    className="sr-only"
                  />
                </div>

                {editingDocument && !selectedFile && (
                  <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                    Editing {editingDocument.originalFileName}. Select another
                    file only when you want to replace it.
                  </div>
                )}

                {selectedFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-500/10">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">
                          {selectedFile.name}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {formatBytes(selectedFile.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/20">
                    <AlertCircle className="h-4 w-4" />
                    {fileError}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      Remarks (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        value={remarks}
                        onChange={(event) => setRemarks(event.target.value)}
                        maxLength={200}
                        rows={2}
                        placeholder="Add any remarks about this document..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-16 text-xs outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900"
                      />
                      <span className="absolute bottom-2 right-3 text-[9px] text-slate-400">
                        {remarks.length} / 200
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingDocument && (
                      <button
                        type="button"
                        onClick={clearUploadForm}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={
                        uploadMutation.isPending ||
                        updateMutation.isPending ||
                        (!editingDocument && !selectedFile)
                      }
                      className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadMutation.isPending || updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving {progress}%
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
                          {editingDocument ? "Save Changes" : "Upload Document"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
