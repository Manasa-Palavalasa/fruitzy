import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers.hooks";
import { User } from "@/types";
import { toast } from "react-toastify";
import { useModal } from "@/contexts/ModalProvider";

export const useAdminUsersPage = () => {
  const [search, setSearch] = useState("");    
  const [page, setPage] = useState(1);
  const {confirm} = useModal();

  const { users, totalPages, isLoading, promoteUserMutation } = useAdminUsers(search, page);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const handlePromote = async (user: User) => {
    if (await confirm(`Make ${user.name} an admin?`)) {
      promoteUserMutation.mutate(
        { userId: user._id },
        {
          onSuccess: () => {
            toast.success(`${user.name} is now admin.`);
          },
          onError: () => {
            toast.error("Failed to promote user.");
          },
        }
      );
    }
  };

  return {
    search,
    page,
    users,
    totalPages,
    isLoading,
    handleSearchChange,
    handlePageChange,
    handlePromote,
  };
};
