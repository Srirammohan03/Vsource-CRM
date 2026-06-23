export const STUDENT_DOCUMENT_KEYS = {
  all: ["student-documents"] as const,

  detail: (studentId: string) =>
    [...STUDENT_DOCUMENT_KEYS.all, studentId] as const,
};
