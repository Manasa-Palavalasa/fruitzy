import { Box, Card, CardContent, Typography, Grid, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard.hooks";
import React from "react";

function AdminDashboard() {

  const { isLoading, isAuthorized } = useAuthGuard({ roles: ["admin"] });

  const router = useRouter();
  const { data: stats, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get<{ products: number; users: number; orders: number }>("/admin/stats")).data,
    enabled: !isLoading && isAuthorized,
  });
  const items = [
    { label: "Products", value: stats?.products, route: "/admin/products" },
    { label: "Users", value: stats?.users, route: "/admin/users" },
    { label: "Orders", value: stats?.orders, route: "/admin/orders" },
  ];


    if (isLoading || !isAuthorized) return <div>Loading or Unauthorized</div>;

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, Admin!
        </Typography>
        <Button variant="contained" onClick={() => router.push("/admin/content")} sx={{ mb: 3 }}>Open Content Studio</Button>
        <Grid container spacing={3}>
          {items.map((item)=>{
            return (
              <Grid key={item.label} item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component={"h2"}>{item.label}</Typography>
                    <Typography variant="h4">{item.value ?? (isError ? "Unavailable" : "...")}</Typography>
                    <Button aria-label={`Manage ${item.label}`} onClick={() => router.push(item.route)} sx={{ mt: 2 }}>Manage {item.label}</Button>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
