import type { AxiosProgressEvent } from "axios";

import { api } from "@/lib/api";

import type {
  ApiResponse,
  StudentDocumentItem,
  StudentDocumentsResponse,
  UploadStudentDocumentVariables,
} from "@/types/student-document";

function unwrapApiData<T>(payload: ApiResponse<T> | T): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export async function getStudentDocuments(
  studentId: string,
): Promise<StudentDocumentsResponse> {
  const response = await api.get<
    ApiResponse<StudentDocumentsResponse> | StudentDocumentsResponse
  >(`/students/${studentId}/documents`);

  return unwrapApiData(response.data);
}

export async function uploadStudentDocument(
  studentId: string,
  variables: UploadStudentDocumentVariables,
): Promise<StudentDocumentItem> {
  const formData = new FormData();

  formData.append("file", variables.file);
  formData.append("documentMasterId", variables.documentMasterId);

  if (variables.remarks?.trim()) {
    formData.append("remarks", variables.remarks.trim());
  }

  const response = await api.post<
    ApiResponse<StudentDocumentItem> | StudentDocumentItem
  >(`/students/${studentId}/documents/upload`, formData, {
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!event.total) return;

      const percentage = Math.round((event.loaded * 100) / event.total);
      variables.onProgress?.(percentage);
    },
  });

  return unwrapApiData(response.data);
}
