import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";

export const useProducts = () => {
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 9;

  const queryParams = useMemo(() => ({
    category: selectedCategories.join(","),
    sort,
    search: searchTerm,
    page,
    limit,
  }), [selectedCategories, sort, searchTerm, page]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => getProducts(queryParams),
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const applyFilters = (categories: string[]) => {
    setSelectedCategories(categories);
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleCategoryDelete = (categoryToDelete: string) => {
    setSelectedCategories((prev) =>
      prev.filter((category) => category !== categoryToDelete)
    );
    setPage(1);
  };

  return {
    data,
    isLoading,
    isError,
    error,
    page,
    sort,
    selectedCategories,
    handlePageChange,
    setSort,
    applyFilters,
    handleSearch,
    handleCategoryDelete,
  };
};
