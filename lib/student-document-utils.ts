import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
]);

export const MAX_STUDENT_DOCUMENT_SIZE = 15 * 1024 * 1024;

export function sanitizeFilePart(value: string, fallback: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  return normalized || fallback;
}

export function validateStudentDocument(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if (
    !ALLOWED_MIME_TYPES.has(file.type) ||
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    throw new Error("Only PDF, JPG, PNG, WEBP, DOC and DOCX files are allowed");
  }

  if (file.size <= 0) {
    throw new Error("The selected file is empty");
  }

  if (file.size > MAX_STUDENT_DOCUMENT_SIZE) {
    throw new Error("The selected file must be 15 MB or smaller");
  }

  return extension;
}

export function buildStudentDocumentFileName(params: {
  studentName: string;
  documentName: string;
  branchCode: string;
  extension: string;
}) {
  const studentName = sanitizeFilePart(params.studentName, "student");
  const documentName = sanitizeFilePart(params.documentName, "document");
  const branchCode = sanitizeFilePart(params.branchCode, "branch");
  const uniquePart = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  return `${studentName}_${documentName}_${branchCode}_${uniquePart}${params.extension}`;
}
