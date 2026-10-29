import { useModal } from "@/contexts/ModalProvider";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart, getCart } from "@/services/cart";

export const useCartHandler = () => {
  const { alert, confirm } = useModal();
  const queryClient = useQueryClient();

  const handleAddToCart = async (productId: string) => {
    try {
      const cart = await getCart();

      const isAlreadyInCart = cart.items.some((item) => item.product._id === productId);
      if (!isAlreadyInCart && cart.items.length >= 5) {
        await alert("You can’t add more than 5 different items to the cart.");
        return;
      }

      if (isAlreadyInCart) {
        const productCount = cart.items.find((item) => item.product._id === productId)?.quantity || 0;
        const proceed = await confirm(`You already have ${productCount} of this product in your cart. Do you want to add one more?`);
        if (!proceed) return;
      }

      await addToCart(productId, 1);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      await alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Login to perform this action.");
    }
  };

  return { handleAddToCart };
};
