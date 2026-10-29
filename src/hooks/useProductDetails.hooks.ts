import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductByID } from "@/services/product";
import { Product } from "@/types";

export function useProductDetails() {
  const router = useRouter();
  const productId = router.query.productId as string;

  const [imgError, setImgError] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { data: product, isError, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProductByID(productId),
    enabled: !!productId,
  });

  const toggleShowCategories = () => setShowAllCategories(prev => !prev);
  const handleImageError = () => setImgError(true);

  return {
    productId,
    product,
    isError,
    isLoading,
    imgError,
    handleImageError,
    showAllCategories,
    toggleShowCategories,
  };
}
