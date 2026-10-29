import { UsersGridProps } from "@/types";
import { Grid, Box, Pagination, Typography, Divider } from "@mui/material";
import UserCard from "./UserCard";
import React from "react";

export default function UsersGrid({users,totalPages,currentPage,onPageChange,onPromote}: UsersGridProps) {
  const nonAdmins = users.filter((user) => user.role !== "admin");
  const admins = users.filter((user) => user.role === "admin");

  if (!users.length)
    return <Typography sx={{ mt: 4, textAlign: "center" }}>No users found.</Typography>;

  return (
    <Box>
      {nonAdmins.length > 0 && (
        <Grid container spacing={2}>
          {nonAdmins.map((user) => (
            <Grid item key={user._id} xs={12} sm={6} md={4} lg={3}>
              <UserCard user={user} onPromote={onPromote} />
            </Grid>
          ))}
        </Grid>
      )}

      {admins.length > 0 && (
        <>
          {nonAdmins.length > 0 && (
            <Box sx={{ my: 4 }}>
              <Divider />
            </Box>
          )}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Admins
          </Typography>
          <Grid container spacing={2}>
            {admins.map((user) => (
              <Grid item key={user._id} xs={12} sm={6} md={4} lg={3}>
                <UserCard user={user} onPromote={onPromote} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary" />
        </Box>
      )}
    </Box>
  );
}
