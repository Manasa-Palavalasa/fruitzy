import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchBar from "@/components/common/SearchBar";
import UsersGrid from "@/components/admin/UsersGrid";
import { useAdminUsersPage } from "@/hooks/useAdminUsersPage.hooks";
import { useAuthGuard } from "@/hooks/useAuthGuard.hooks";
import React from "react";

function AdminUsersPage() {
  const {search,page,users,totalPages,isLoading,handleSearchChange,handlePageChange,handlePromote} = useAdminUsersPage();
  const { isAuthorized } = useAuthGuard({ roles: ["admin"] });

  if (!isAuthorized) return <div>Unauthorized</div>;
  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>Manage Users</Typography>

        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search users..."
        />

        {isLoading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <UsersGrid
            users={users}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
            onPromote={handlePromote}
          />
        )}
      </Box>
    </Box>
  );
}

export default AdminUsersPage;
