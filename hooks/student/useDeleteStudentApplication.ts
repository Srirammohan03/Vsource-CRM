// hooks/student/useDeleteStudentApplication.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { STUDENTKEY } from "@/services/student/query-key";

export const useDeleteStudentApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { data } = await api.delete(
        `/students/applications/${applicationId}`,
      );

      return data;
    },

    onSuccess: (data) => {
      toast.success(data?.message ?? "Application deleted successfully");

      queryClient.invalidateQueries({
        queryKey: STUDENTKEY.all,
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to delete application",
      );
    },
  });
};
