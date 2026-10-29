import { useRouter } from "next/router";
import { useEffect } from "react";
import { roleType, useAuth } from "@/contexts/AuthContext";


interface Options {
  roles?: roleType[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
}

export const useAuthGuard = (options?: Options): {
  isLoading: boolean;
  isAuthorized: boolean;
} => {
  const { token, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.replace(options?.redirectTo ?? "/auth/Login");
    } else if (options?.roles && (!role || !options.roles.includes(role))) {
      router.replace(options.unauthorizedRedirectTo ?? "/");
    }
  }, [token, role, isLoading, options?.roles, options?.redirectTo, options?.unauthorizedRedirectTo, router]);

  const isAuthorized =
    Boolean(token) && (!options?.roles || (role !== null && options.roles.includes(role)));

  return {
    isLoading,
    isAuthorized,
  };
};


