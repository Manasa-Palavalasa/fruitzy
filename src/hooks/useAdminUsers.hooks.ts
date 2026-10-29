import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export function useAdminUsers(search: string, page: number, limit: number = 8) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: { search, page, limit },
      });
      return res.data;
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await api.patch(`/admin/users/${userId}`, { role: "admin" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    users: data?.users || [],
    totalPages: data?.totalPages || 1,
    isLoading,
    isError,
    promoteUserMutation,
  };
}
