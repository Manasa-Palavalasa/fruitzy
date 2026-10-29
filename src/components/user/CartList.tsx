import React from 'react';
import { Grid } from '@mui/material';
import { CartListProps } from '@/types';
import CartItem from './CartItem';



const CartList: React.FC<CartListProps> = ({ items, onUpdateQuantity, onRemoveItem }) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Grid container spacing={3}>
      {items.map(item => (
        <Grid item xs={12} key={item.product._id}>
          <CartItem
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            totalItems={totalItems}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default CartList;
