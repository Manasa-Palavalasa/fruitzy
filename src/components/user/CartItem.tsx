import React from 'react';
import {
  Card, CardMedia, CardContent, Typography, Box, IconButton
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { CartItemProps } from '@/types';



const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const { product, quantity } = item;

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <CardMedia
        component="img"
        image={`/${product.slug}.jpg`}
        alt={product.name}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; 
          target.src = 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=1080';
        }}
        sx={{ width: 100, height: 100, objectFit: 'contain', mr: 2 }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{product.name}</Typography>
        <Typography color="text.secondary">₹{product.price.toFixed(2)}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <IconButton
            onClick={() => quantity > 1 && onUpdateQuantity(product._id, quantity - 1)}
          >
            <Remove />
          </IconButton>
          <Typography mx={1}>{quantity}</Typography>
          <IconButton
            onClick={() => {
              onUpdateQuantity(product._id, quantity + 1);
            }}
          >
            <Add />
          </IconButton>
          <IconButton sx={{ ml: 2 }} onClick={() => onRemoveItem(product._id)}>
            <Delete color="error" />
          </IconButton>
        </Box>
      </CardContent>
      <Box sx={{ pr: 3 }}>
        <Typography variant="subtitle1">
          Subtotal: ₹{(product.price * quantity).toFixed(2)}
        </Typography>
      </Box>
    </Card>
  );
};

export default CartItem;
