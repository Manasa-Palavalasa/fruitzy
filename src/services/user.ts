import { AddressType, APIError, UserProfileType } from "@/types";
import api from "./api";


export const getProfile = async () => {
  try {
    const res = await api.get("/user/profile");
    return res.data.user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};


export const addAddress = async (address: Omit<AddressType, "_id">) => {
  try {
    const res = await api.post("/user/address", address);
    return res.data.addresses;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

// Remove Address
export const removeAddress = async (id: string) => {
  try {
    const res = await api.delete(`/user/address/${id}`);
    return res.data.addresses;
  } catch (error) {
    console.error("Error removing address:", error);
    throw error;
  }
};



 export const fetchAddresses = async () => {
    try {
      const profile: UserProfileType = await getProfile();
      return (profile.addresses);
    } catch (err) {
      const error = err as APIError;
      throw error;
    }
  };