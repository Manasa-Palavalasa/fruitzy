import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addReview } from "@/services/review";

export const useAddReviewMutation = (
  productId: string,
  setPage: (page: number) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, review }: { rating: number; review: string }) =>
      addReview(productId, rating, review),
    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });
};
