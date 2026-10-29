import { Cart } from "@/types";
import api from "./api";

export const getCart = async ():Promise<Cart> => {
  try {
    const res = await api.get("/cart");
    return res.data.cart; 
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (productId: string, quantity: number) => {
  try {
    const res = await api.post("/cart", { productId, quantity });
    return res.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (productId: string, quantity: number) => {
  try {
    const res = await api.put(`/cart/${productId}`, { quantity });
    return res.data.cart;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeCartItem = async (productId: string) => {
  try {
    const res = await api.delete(`/cart/${productId}`);
    return res.data.cart;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

// Clear Cart => yet to be added
export const clearCart = async () => {
  try {
    const res = await api.delete("/cart/clear");
    return res.data.cart;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};