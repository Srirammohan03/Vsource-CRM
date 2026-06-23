import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/api-helpers";
import {
  StudentVisaLoanProfile,
  StudentVisaLoanProfilePayload,
} from "@/types/student";

export const getStudentVisaLoanProfile = async (
  studentId: string,
): Promise<StudentVisaLoanProfile | null> => {
  const response = await api.get<ApiResponse<StudentVisaLoanProfile | null>>(
    `/students/${studentId}/visa-loan-profile`,
  );

  return response.data?.data ?? null;
};

export const saveStudentVisaLoanProfile = async (
  studentId: string,
  payload: StudentVisaLoanProfilePayload,
): Promise<StudentVisaLoanProfile> => {
  const response = await api.post<ApiResponse<StudentVisaLoanProfile>>(
    `/students/${studentId}/visa-loan-profile`,
    payload,
  );

  if (!response.data?.data) {
    throw new Error(
      response.data?.message || "Unable to save visa and loan profile",
    );
  }

  return response.data.data;
};
