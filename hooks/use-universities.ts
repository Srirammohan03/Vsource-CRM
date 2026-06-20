// crm-frontend-next\app\hooks\use-universities.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { University } from "@/types/university";
import { UniversityFormValues } from "@/lib/university-schema";

export function useUniversities() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const response = await axios.get("/api/universities");
      return response.data.data as University[];
    },
  });

  const universities = data || [];

  const addMutation = useMutation({
    mutationFn: async (university: UniversityFormValues) => {
      const response = await axios.post("/api/universities", university);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UniversityFormValues }) => {
      const response = await axios.put(`/api/universities/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/universities/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });

  return {
    universities,
    isLoading,
    error,
    addUniversity: addMutation.mutateAsync,
    updateUniversity: (id: string, data: UniversityFormValues) => updateMutation.mutateAsync({ id, data }),
    deleteUniversity: deleteMutation.mutateAsync,
  };
}