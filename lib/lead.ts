import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useCounselors = (branchId?: string) => {
  return useQuery({
    queryKey: ["branch-counselors", branchId],

    enabled: !!branchId,

    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/branches/${branchId}/counselors`,
        {
          withCredentials: true,
        },
      );

      return data?.data ?? [];
    },
  });
};
