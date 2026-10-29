import { Box, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Typography, Pagination, CircularProgress } from '@mui/material';
import { OrderType } from '@/types';
import { useAdminOrders } from '@/hooks/useAdminOrders.hooks';
import React from "react";

export default function AdminOrdersPage() {
  const { data, isLoading, isError, page, handlePageChange } = useAdminOrders();

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Admin Orders
      </Typography>

      {(!data || isLoading) ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error">Failed to load orders.</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.orders.map((order: OrderType) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                    <TableCell>{order.user?.email || 'N/A'}</TableCell>
                    <TableCell>{order.orderStatus}</TableCell>
                    <TableCell>{order.paymentStatus}</TableCell>
                    <TableCell>₹{order.totalAmount}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={data.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}
