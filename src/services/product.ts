import { GetProductsResponse, Product } from "@/types";
import api from "./api";

export const getProducts = async (params?: {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<GetProductsResponse> => {
  const res = await api.get<GetProductsResponse>("/products", { params });
  return res.data;
};


export const getProductByID = async (id: string):Promise<Product> => {  
  const res = await api.get(`/products/${id}`);
  return res.data.product;
};