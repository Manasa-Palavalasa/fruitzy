import { GetAllOrdersResponse } from "@/types";
import api from "./api";

function productPayload(formData: FormData) {
  return {
    image: formData.get("image") || "/banner1.jpg", name: formData.get("name"), slug: formData.get("slug"), description: formData.get("description"),
    categories: formData.getAll("categories"), price: Number(formData.get("price")),
    stock: Number(formData.get("stock")), isPopular: formData.get("isPopular") === "true",
  };
}

export const addProduct = async (formData: FormData) => { 
  try {
    const res = await api.post("/products", productPayload(formData));
    return res.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, formData: FormData) => {
  try {
    const res = await api.put(`/products/${id}`, productPayload(formData));
    return res.data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};



export const getAllOrders = async (page = 1): Promise<GetAllOrdersResponse> => {
  try {
    const res = await api.get("/admin/orders", { params: { page, limit: 10 } });
    return res.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};
