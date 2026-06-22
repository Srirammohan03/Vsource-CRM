// hooks/student/useUpdateStudentApplication.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STUDENTKEY } from "@/services/student/query-key";

export const useUpdateStudentApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: any;
    }) => {
      const { data } = await api.patch(
        `/students/applications/${applicationId}`,
        payload,
      );

      return data;
    },

    onSuccess: (data) => {
      toast.success(data?.message ?? "Application updated successfully");

      queryClient.invalidateQueries({
        queryKey: STUDENTKEY.all,
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to update application",
      );
    },
  });
};
