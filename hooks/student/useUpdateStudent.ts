// hooks/student/useUpdateStudent.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {api} from "@/lib/api";
import { STUDENTKEY } from "@/services/student/query-key";

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: any;
    }) => {
      const { data } = await api.patch(
        `/students/${id}`,
        payload
      );

      return data;
    },

    onSuccess: (data) => {
      toast.success(
        data?.message ??
          "Student updated successfully"
      );

      queryClient.invalidateQueries({
        queryKey: STUDENTKEY.all,
      });

      queryClient.invalidateQueries({
        queryKey: STUDENTKEY.one,
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to update student"
      );
    },
  });
};