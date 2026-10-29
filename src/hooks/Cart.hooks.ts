import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, updateCartItem, removeCartItem } from '@/services/cart';
import { Cart } from '@/types';

export const useCart = () => {
  const queryClient = useQueryClient();

  const { data: cart, isLoading, error } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: getCart
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: (err) => {
      console.error('Failed to update cart item quantity:', err);
      alert('Failed to update item quantity. Please try again.');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: (err) => {
      console.error('Failed to remove cart item:', err);
      alert('Failed to remove item. Please try again.');
    },
  });

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantityMutation.mutate({ productId, quantity });
  };

  const handleRemoveItem = (productId: string) => {
    removeItemMutation.mutate(productId);
  };

  return {
    cart,
    isLoading,
    error,
    handleUpdateQuantity,
    handleRemoveItem,
  };
};
