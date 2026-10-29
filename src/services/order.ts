import api from "./api";

export const placeOrder = async (addressId: string, paymentMethod: string) => {
  try {

    const res = await api.post("/orders", { addressId, paymentMethod });
    return res.data.order;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};
