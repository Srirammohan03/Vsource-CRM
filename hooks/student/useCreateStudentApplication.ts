// hooks/student/useCreateStudentApplication.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTKEY } from "@/services/student/query-key";

export const useCreateStudentApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: any;
    }) => {
      const { data } = await api.post(
        `/students/${studentId}/applications`,
        payload,
      );

      return data;
    },

    onSuccess: (data) => {
      toast.success(data?.message ?? "Application added successfully");

      queryClient.invalidateQueries({
        queryKey: STUDENTKEY.all,
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to add application",
      );
    },
  });
};
