import axios from "axios";
import type {
  StudentDocumentRecord,
  StudentDocumentsResponse,
} from "@/types/student";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function getStudentDocuments(studentId: string) {
  const response = await axios.get<ApiResponse<StudentDocumentsResponse>>(
    `/api/students/${studentId}/documents`,
  );

  return response.data.data;
}

export async function uploadStudentDocument(params: {
  studentId: string;
  documentCode: string;
  file: File;
  remarks?: string;
  onProgress?: (progress: number) => void;
}) {
  const formData = new FormData();

  formData.append("documentCode", params.documentCode);
  formData.append("file", params.file);
  formData.append("remarks", params.remarks || "");

  const response = await axios.post<ApiResponse<StudentDocumentRecord>>(
    `/api/students/${params.studentId}/documents`,
    formData,
    {
      onUploadProgress: (event) => {
        if (!event.total) return;

        params.onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    },
  );

  return response.data.data;
}

export async function updateStudentDocument(params: {
  studentId: string;
  documentId: string;
  file?: File | null;
  remarks?: string;
  onProgress?: (progress: number) => void;
}) {
  const formData = new FormData();

  if (params.file) {
    formData.append("file", params.file);
  }

  formData.append("remarks", params.remarks || "");

  const response = await axios.put<ApiResponse<StudentDocumentRecord>>(
    `/api/students/${params.studentId}/documents/${params.documentId}`,
    formData,
    {
      onUploadProgress: (event) => {
        if (!event.total) return;

        params.onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    },
  );

  return response.data.data;
}

export async function deleteStudentDocument(params: {
  studentId: string;
  documentId: string;
}) {
  await axios.delete(
    `/api/students/${params.studentId}/documents/${params.documentId}`,
  );
}
