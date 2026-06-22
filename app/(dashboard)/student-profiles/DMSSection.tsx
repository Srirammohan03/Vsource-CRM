"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  FileText,
  FolderOpen,
  Upload,
  RefreshCw,
  Trash2,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Clean TypeScript Data Modeling definitions
export interface DocumentItem {
  id: string;
  studentId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string | Date;
  createdAt: string | Date;
}

interface DMSSectionProps {
  studentId: string;
  studentName: string;
  isDarkMode: boolean;
}

export function DMSSection({
  studentId,
  studentName,
  isDarkMode,
}: DMSSectionProps) {
  const queryClient = useQueryClient();

  // Controlled Interface View State Management Hooks
  const [selectedCategory, setSelectedCategory] = useState<string>("Passport");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [noticeMessage, setNoticeMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Standard static Category buckets mapping inside global structure
  const categoriesList = [
    "Passport",
    "10th Marks Memo",
    "12th Marks Memo",
    "Bachelors Degree",
    "Transcript Documents",
    "IELTS/PTE Score Card",
    "Statement of Purpose (SOP)",
    "Letters of Recommendation (LOR)",
    "Experience Documents",
    "Resume/CV",
    "Financial Statements",
    "Visa Application Forms",
  ];

  const triggerNotice = (text: string, type: "success" | "error") => {
    setNoticeMessage({ text, type });
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // 1. TanStack Query: Fetch current student file logs
  const {
    data: serverResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student-documents", studentId],
    queryFn: async () => {
      const res = await axios.get(`/api/students/${studentId}/documents`);
      return res.data;
    },
    enabled: !!studentId,
  });

  const documents: DocumentItem[] = serverResponse?.success
    ? serverResponse.data
    : [];

  // 2. TanStack Mutation: Remote File Upload Handlers
  const uploadMutation = useMutation({
    mutationFn: async (payload: { file: File; category: string }) => {
      const dataForm = new FormData();
      dataForm.append("file", payload.file);
      dataForm.append("documentType", payload.category);
      const res = await axios.post(
        `/api/students/${studentId}/documents`,
        dataForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        triggerNotice(
          "Document file synced and logged successfully.",
          "success",
        );
        queryClient.invalidateQueries({
          queryKey: ["student-documents", studentId],
        });
      } else {
        triggerNotice(
          data.message || "Failed running document storage registration.",
          "error",
        );
      }
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.message ||
        "Network exception encountered writing file logs.";
      triggerNotice(errMsg, "error");
    },
  });

  // 3. TanStack Mutation: Resource Purge Lifecycle Routines
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await axios.delete(
        `/api/students/${studentId}/documents/${docId}`,
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        triggerNotice(
          "Document tracking information purged from server system logs.",
          "success",
        );
        if (selectedDoc?.id) setSelectedDoc(null);
        queryClient.invalidateQueries({
          queryKey: ["student-documents", studentId],
        });
      } else {
        triggerNotice(
          data.message || "Failed running file drops from ledger map.",
          "error",
        );
      }
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.message ||
        "Network exception encountered running data extraction drops.";
      triggerNotice(errMsg, "error");
    },
  });

  // Handle file input selection events natively
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetCategory: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const targetFile = e.target.files[0];
      uploadMutation.mutate({ file: targetFile, category: targetCategory });
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoomScale((prev) =>
      direction === "in"
        ? Math.min(prev + 0.2, 3.0)
        : Math.max(prev - 0.2, 0.5),
    );
  };

  const handleRotate = () => {
    setRotationDegrees((prev) => (prev + 90) % 360);
  };

  // Filter global files list according to client category view choices
  const currentCategoryDocs = documents.filter(
    (d) => d.documentType === selectedCategory,
  );

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
    >
      {/* Dynamic Status Notifications Alert Banner Bar */}
      <AnimatePresence>
        {noticeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
              noticeMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {noticeMessage.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            )}
            <span>{noticeMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Tracking Identity Sub-Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 mb-6 border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/10 text-red-500">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Document Management Locker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure verification hub for{" "}
              <span className="font-semibold text-red-500">{studentName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/30">
          <span className="text-slate-400">STUDENT_ID:</span>
          <span className="font-bold text-slate-200">{studentId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Category Navigation Controls Sidebar Block */}
        <div className="xl:col-span-4 flex flex-col gap-1.5 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
          {categoriesList.map((category) => {
            const hasDocs = documents.some((d) => d.documentType === category);
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedDoc(null);
                  setZoomScale(1.0);
                  setRotationDegrees(0);
                }}
                className={`w-full flex items-center justify-between text-left p-3 rounded-xl text-xs font-medium transition-all group ${
                  isSelected
                    ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                    : isDarkMode
                      ? "bg-slate-800/40 hover:bg-slate-800 text-slate-300"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText
                    className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-slate-400 group-hover:text-red-500"}`}
                  />
                  <span className="truncate">{category}</span>
                </div>
                {hasDocs && (
                  <span
                    className={`text-[10px] px-2 py-0.5 font-bold font-mono rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-red-500/10 text-red-500"}`}
                  >
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Central Workspace File Control Deck Canvas Panel */}
        <div className="xl:col-span-8 flex flex-col gap-4 min-h-[500px]">
          {/* Main Upload Dropzone Controller Card Box */}
          <div
            className={`p-5 rounded-xl border border-dashed transition-all ${
              isDarkMode
                ? "bg-slate-800/20 border-slate-750"
                : "bg-slate-50/50 border-slate-300"
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center py-4">
              <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-2">
                {uploadMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <p className="text-xs font-semibold mb-1">
                {uploadMutation.isPending
                  ? "Ingesting physical block contents..."
                  : `Upload resource to [${selectedCategory}]`}
              </p>
              <p className="text-[11px] text-slate-400 mb-4">
                Supported Extensions: PDF, PNG, JPG, WEBP (Max 5MB)
              </p>

              <label className="relative inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow cursor-pointer transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>Select Document File</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  disabled={uploadMutation.isPending}
                  onChange={(e) => handleFileChange(e, selectedCategory)}
                />
              </label>
            </div>
          </div>

          {/* Core File Asset Data List Grid Matrix Box */}
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Available Files ({currentCategoryDocs.length})
            </h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                <span>Reading document vault records...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-xs text-rose-500 font-medium">
                Failed to sync system database logs.
              </div>
            ) : currentCategoryDocs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 border rounded-xl border-dashed border-slate-700/20">
                No files loaded under this category classification structure.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCategoryDocs.map((doc) => {
                  const isPdf = doc.fileName.toLowerCase().endsWith(".pdf");

                  return (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        selectedDoc?.id === doc.id
                          ? "border-red-500 bg-red-500/5 shadow-sm"
                          : isDarkMode
                            ? "bg-slate-800/40 border-slate-750"
                            : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-slate-700/30 rounded-lg shrink-0 text-slate-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="truncate flex-1">
                          <p
                            className="text-xs font-semibold truncate text-slate-200"
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(doc.uploadedAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-700/10">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setZoomScale(1.0);
                            setRotationDegrees(0);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-700/30 transition-all"
                          title="Preview Document File"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-700/30 transition-all"
                          title="Download Resource File File"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Confirm asset termination drop? This deletes the physical disk entry permanently.",
                              )
                            ) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-700/30 transition-all"
                          title="Purge Archive Record File"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Inspection Frame Panel Area */}
          {selectedDoc && (
            <div
              className={`mt-4 p-4 rounded-xl border flex flex-col gap-3 ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800"
                  : "bg-slate-100 border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-700/20">
                <span className="text-xs font-bold truncate max-w-[70%]">
                  Preview: {selectedDoc.fileName}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleZoom("out")}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold w-12 text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom("in")}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center gap-1 text-[10px] px-2"
                  >
                    <RefreshCw className="h-3 w-3" /> Pivot
                  </button>
                </div>
              </div>

              <div className="w-full h-96 overflow-auto rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-4 relative">
                {selectedDoc.fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={`${selectedDoc.fileUrl}#toolbar=0`}
                    className="w-full h-full rounded bg-white"
                    style={{
                      transform: `scale(${zoomScale}) rotate(${rotationDegrees}deg)`,
                      transition: "transform 0.2s ease-in-out",
                    }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedDoc.fileUrl}
                    alt="Inspection Frame Panel Asset View"
                    className="max-h-full max-w-full object-contain"
                    style={{
                      transform: `scale(${zoomScale}) rotate(${rotationDegrees}deg)`,
                      transition: "transform 0.2s ease-in-out",
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
