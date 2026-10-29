import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { Product } from "@/types";

export function useBrowseByCategories() {
  const [category, setCategory] = useState("fruits");
  const [showAll, setShowAll] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setCategory(newValue);
    setShowAll(false);
  };

  const fetchProducts = async () => {
    const { products } = await getProducts();
    return products;
  };

  const { data: allProducts = [], isLoading, isError } = useQuery({
    queryKey: ["productCategories"],
    queryFn: fetchProducts,
  });

  const filteredProducts = useMemo(() => {
    if (category === "fruits") return allProducts;
    return allProducts.filter((product: Product) =>
      product.categories.includes(category)
    );
  }, [category, allProducts]);

  const productsToShow = showAll
    ? filteredProducts
    : filteredProducts.slice(0, 3);

  return {
    category,
    setCategory,
    showAll,
    setShowAll,
    handleChange,
    isLoading,
    isError,
    productsToShow,
    filteredProducts,
  };
}
