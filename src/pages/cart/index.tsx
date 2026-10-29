import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CartList from '@/components/user/CartList';
import CartSummary from '@/components/user/CartSummary';
import { useRouter } from 'next/router';
import { useCart } from '@/hooks/Cart.hooks';
import { useAuthGuard } from '@/hooks/useAuthGuard.hooks';

const CartPage = () => {
  const router = useRouter();
  const { cart, isLoading, error, handleUpdateQuantity, handleRemoveItem } = useCart();
  const { isAuthorized } = useAuthGuard({ roles: ["user"] });

  if (!isAuthorized) return <div>Unauthorized</div>;

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      alert('Add items to cart for checkout');
    } else {
      router.push('/cart/checkout');
    }
  };

  if (isLoading) return <Typography>Loading cart...</Typography>;
  if (error || !cart) return <Typography>Error loading cart. Please try again.</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
      {cart.items.length === 0 ? (
        <Typography variant="h6">Your cart is empty.</Typography>
      ) : (
        <>
          <CartList
            items={cart.items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
          <Divider sx={{ my: 3 }} />
          <CartSummary items={cart.items} onCheckout={handleCheckout} />
        </>
      )}
    </Box>
  );
};

export default CartPage;
