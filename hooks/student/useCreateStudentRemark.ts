// hooks/student/useCreateStudentRemark.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { STUDENTKEY } from "@/services/student/query-key";

export const useCreateStudentRemark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      note,
    }: {
      studentId: string;
      note: string;
    }) => {
      const { data } = await api.post(`/students/${studentId}/remarks`, {
        note,
      });

      return data;
    },

    onSuccess: (data) => {
      toast.success(data?.message ?? "Remark added successfully");

      queryClient.invalidateQueries({
        queryKey: STUDENTKEY.all,
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to add remark");
    },
  });
};
