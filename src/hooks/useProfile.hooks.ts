import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, addAddress, removeAddress } from "@/services/user";
import { AddressType, UserProfileType } from "@/types";
import { useModal } from "@/contexts/ModalProvider";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const {confirm} = useModal();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UserProfileType>({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const handleAddAddress = async (address: Omit<AddressType, "_id">) => {
    await addAddress(address);
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (await confirm("Delete this Address?")) {
      await removeAddress(addressId);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  return {
    profile,
    isLoading,
    isError,
    handleAddAddress,
    handleDeleteAddress,
  };
};
