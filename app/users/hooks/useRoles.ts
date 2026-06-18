import { api } from "@/lib/api";
import { roleKeys } from "@/rbac/query-keys";
import { useQuery } from "@tanstack/react-query";

const getRoles = async () => {
  const { data } = await api.get("/roles");

  return data?.data || [];
};

export const useRoles = () => {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: getRoles,
  });
};
