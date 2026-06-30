// hooks/student/useCreateStudentRemark.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { REMARKS } from "@/services/student/query-key";

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
        queryKey: REMARKS.all,
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to add remark");
    },
  });
};

export const useRemarks = (id: string) => {
  return useQuery({
    queryKey: REMARKS.all,
    queryFn: async () => {
      const { data } = await api.get(`/students/${id}/remarks`);
      return data?.data || [];
    },
  });
};
