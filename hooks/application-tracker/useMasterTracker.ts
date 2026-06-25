// hooks/application-tracker/useMasterTracker.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useMasterTracker = () => {
  return useQuery({
    queryKey: ["master-tracker"],
    queryFn: async () => {
      // let leads = [];
      let students = [];

      // try {
      //   const leadsRes = await axios.get(`${API}/leads`, {
      //     withCredentials: true,
      //   });

      //   leads = leadsRes.data?.data ?? [];
      // } catch (err) {
      //   console.error("Leads Error", err);
      // }

      try {
        const studentsRes = await axios.get(`${API}/students`, {
          withCredentials: true,
        });

        students = studentsRes.data?.data ?? [];
      } catch (err) {
        console.error("Students Error", err);
      }

      return {
        // leads,
        students,
      };
    },
  });
};
