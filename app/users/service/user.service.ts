import { api } from "@/lib/api";

export const getUsers = async () => {
  const { data } = await api.get("/users");

  return data?.data || [];
};

export const getUserById = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);

  return data?.data;
};

export const createUser = async (payload: any) => {
  const { data } = await api.post("/users", payload);

  return data?.data;
};

export const updateUser = async (id: string, payload: any) => {
  const { data } = await api.put(`/users/${id}`, payload);

  return data?.data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/users/${id}`);

  return data?.data;
};
