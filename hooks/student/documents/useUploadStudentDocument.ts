"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { uploadStudentDocument } from "@/services/student/document.service";
import { STUDENT_DOCUMENT_KEYS } from "@/services/student/document-query-key";
import { STUDENTKEY } from "@/services/student/query-key";
import { ApiResponse } from "@/lib/api-helpers";
import { UploadStudentDocumentVariables } from "@/types/student";

type ApiErrorPayload = Partial<ApiResponse<unknown>> & {
  error?: string;
};

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorPayload>;

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message ||
    "Document upload failed."
  );
}

export function useUploadStudentDocument(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UploadStudentDocumentVariables) =>
      uploadStudentDocument(studentId, variables),

    onSuccess: async () => {
      toast.success("Document uploaded successfully.");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: STUDENT_DOCUMENT_KEYS.detail(studentId),
        }),
        queryClient.invalidateQueries({
          queryKey: STUDENTKEY.all,
        }),
      ]);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
