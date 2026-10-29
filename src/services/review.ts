import api from "./api";


export const addReview = async (productId: string, rating: number, review: string) => {
  const res = await api.post(`/products/${productId}/review`, { rating, review });
  return res.data;
};


export const getReviews = async (productId: string, page: number = 1, limit: number = 10) => {
  const res = await api.get(`/reviews/${productId}`, { params: { page, limit } });
  return res.data;
};