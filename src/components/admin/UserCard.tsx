import { useRole } from "@/hooks/useRole.hooks";
import { UserCardProps } from "@/types";
import { Card, CardContent, Typography, CardActions, Button, Chip } from "@mui/material";
import React from "react";

export default function UserCard({ user, onPromote }: UserCardProps) {
  const {isAdmin} = useRole();
  return (
    <Card sx={{ width: "100%", minWidth: 250 }}>
      <CardContent>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="textSecondary">{user.email}</Typography>
        <Chip
          label={isAdmin ? "Admin" : "User"}
          color={isAdmin ? "success" : "default"}
          sx={{ mt: 1 }} />
      </CardContent>
      <CardActions>
        {!isAdmin && (
          <Button size="small" onClick={() => onPromote(user)}>
            Make Admin
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
