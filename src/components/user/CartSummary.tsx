import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CartSummaryProps } from '@/types';



function CartSummary({ items, onCheckout }:CartSummaryProps) {

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
      <Typography variant="h6">Total: ₹{total.toFixed(2)}</Typography>
      <Button variant="contained" color="primary" size="large" onClick={onCheckout}>
        Checkout
      </Button>
    </Box>
  );
};

export default CartSummary;
