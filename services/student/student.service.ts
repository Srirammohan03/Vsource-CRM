// services/student.service.ts

import { api } from "@/lib/api";


export const studentService = {
  async getStudents(params?: Record<string, any>) {
    const { data } = await api.get("/students", {
      params,
    });

    return data;
  },

  async getStudent(id: string) {
    const { data } = await api.get(`/students/${id}`);

    return data;
  },
};