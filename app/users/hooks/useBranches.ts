import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const getBranches = async () => {
  const { data } = await api.get("/branches");

  return data?.data || [];
};

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });
};
