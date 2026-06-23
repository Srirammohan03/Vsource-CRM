export const STUDENT_VISA_LOAN_PROFILE_KEY = {
  all: ["student-visa-loan-profile"] as const,
  detail: (studentId: string) =>
    [...STUDENT_VISA_LOAN_PROFILE_KEY.all, studentId] as const,
};
