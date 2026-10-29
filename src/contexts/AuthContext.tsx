import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export type roleType = "user" | "admin";
interface AuthContextType {
  token: string | null;
  role: roleType | null;
  isLoading: boolean;
  login: (token: string, role: roleType) => void;
  logout: () => void;
  isAdmin: boolean | null;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<roleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    const storedToken = localStorage.getItem("token");
    if (!storedToken) { setIsLoading(false); return; }
    api.get("/user/profile").then(({ data }) => {
      if (!active || localStorage.getItem("token") !== storedToken) return;
      setToken(storedToken);
      setRole(data.user.role);
      localStorage.setItem("role", data.user.role);
    }).catch(() => {
      if (active && localStorage.getItem("token") === storedToken) {
        localStorage.removeItem("token"); localStorage.removeItem("role");
        queryClient.clear();
      }
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [queryClient]);

  const login = (nextToken: string, nextRole: roleType) => {
    queryClient.clear();
    setToken(nextToken); setRole(nextRole);
    localStorage.setItem("token", nextToken); localStorage.setItem("role", nextRole);
    setIsLoading(false);
  };
  const logout = () => {
    if (token) void api.post("/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
    setToken(null); setRole(null); setIsLoading(false);
    localStorage.removeItem("token"); localStorage.removeItem("role");
    queryClient.clear();
  };
  return <AuthContext.Provider value={{ token, role, login, logout, isLoading, isAdmin: role === null ? null : role === "admin" }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Use Auth must be provided");
  return context;
};
