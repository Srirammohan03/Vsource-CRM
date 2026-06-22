// hooks/useStudents.ts

import { useQuery } from "@tanstack/react-query";
import { DOCUMENT } from "@/services/student/query-key";
import { api } from "@/lib/api";

export const useDocuments = (
  studentId: string,
  filters?: Record<string, any>,
) => {
  return useQuery({
    queryKey: [...DOCUMENT.all, filters],

    queryFn: async () => {
      const res = await api.get(`/api/students/${studentId}/documents`);
      return res.data;
    },
    enabled: !!studentId,
  });
};
