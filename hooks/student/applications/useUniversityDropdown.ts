import { api } from "@/lib/api";
import { APPLICATION } from "@/services/student/query-key";
import { useQuery } from "@tanstack/react-query";

export const useUniversityDropdown = (studentId?: string) => {
  return useQuery({
    queryKey: [...APPLICATION.universityDropDown, studentId],
    queryFn: async () => {
      const { data } = await api.get(
        `/universities/dropdown?studentId=${studentId}`,
      );

      return data?.data || [];
    },
    enabled: !!studentId,
  });
};

export const useCourseDropdown = (universityId?: string) => {
  return useQuery({
    queryKey: [...APPLICATION.courseDropDown, universityId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as [string, string | undefined];
      const { data } = await api.get(`/universities/${id}/courses/dropdown`);
      return data?.data || [];
    },
    enabled: Boolean(universityId),
  });
};
