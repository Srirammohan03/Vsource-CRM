// hooks/useStudents.ts

import { useQuery } from "@tanstack/react-query";

import { studentService } from "@/services/student/student.service";
import { STUDENTKEY } from "@/services/student/query-key";

export const useStudents = (
  filters?: Record<string, any>
) => {
  return useQuery({
    queryKey: [...STUDENTKEY.all, filters],

    queryFn: () =>
      studentService.getStudents(filters),

    staleTime: 0,
  });
};