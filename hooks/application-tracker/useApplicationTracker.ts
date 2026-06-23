// hooks\application-tracker\useApplicationTracker.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useApplicationTracker = () => {
  return useQuery({
    queryKey: ["application-tracker"],
    queryFn: async () => {
      const [leadsRes, mbbsRes, studentsRes] = await Promise.all([
        axios.get(`${API}/leads`, { withCredentials: true }),
        axios.get(`${API}/mbbs-leads`, { withCredentials: true }),
        axios.get(`${API}/students`, { withCredentials: true }),
      ]);

      return {
        leads: leadsRes.data?.data ?? [],
        mbbsLeads: mbbsRes.data?.data ?? [],
        students: studentsRes.data?.data ?? [],
      };
    },
  });
};
