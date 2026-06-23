// hooks/application-tracker/useMbbsTracker.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useMbbsTracker = () => {
  return useQuery({
    queryKey: ["mbbs-tracker"],
    queryFn: async () => {
      const mbbsRes = await axios.get(`${API}/mbbs-leads`, {
        withCredentials: true,
      });

      return {
        mbbsLeads: mbbsRes.data?.data ?? [],
      };
    },
  });
};
