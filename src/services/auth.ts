
import { AuthResponse } from "@/types/auth.types";
import api from "./api";

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/signup", { name, email, password });
  return res.data; 
};


export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
};