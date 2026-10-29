import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAddresses } from "@/services/user";
import { placeOrder } from "@/services/order";
import { useRouter } from "next/router";
import { AddressType } from "@/types";

export const useCheckout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: addresses,
    isLoading: isAddressesLoading,
    isError: isAddressesError,
  } = useQuery<AddressType[]>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const {
    mutate: placeOrderMutation,
    status: placeOrderStatus,
  } = useMutation({
    mutationFn: () =>
      placeOrder(selectedAddressId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSuccessMessage("Order placed successfully!");
      router.push("/cart");
    },
    onError: (error) => {
      setErrorMessage((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to place order");
    },
  });

  const isPlacingOrder = placeOrderStatus === "pending";

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      setErrorMessage("Please select an address");
      return;
    }
    placeOrderMutation();
  };

  return {
    addresses,
    isAddressesLoading,
    isAddressesError,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    successMessage,
    errorMessage,
    handlePlaceOrder,
    isPlacingOrder,
    router,
  };
};
