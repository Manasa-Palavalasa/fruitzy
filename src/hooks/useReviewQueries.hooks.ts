import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/services/review";

export const useGetReviews = (productId: string, page: number) => {
    return useQuery({
        queryKey: ["reviews", productId, page],
        queryFn: () => getReviews(productId, page, 3),
    });
};
