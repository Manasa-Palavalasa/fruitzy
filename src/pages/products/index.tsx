import {
  Grid,
  CircularProgress,
  Typography,
  Pagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import React from "react";
import FilterModal from "@/components/common/Filter";
import ProductCard from "@/components/common/ProductCard";
import SearchBar from "@/components/common/SearchBar";
import { sortOptions } from "../../../static/mockData";
import { Product } from "@/types";
import { useProducts } from "@/hooks/useProducts.hooks";

export default function Products() {
  const {data,isLoading,isError,error,sort,selectedCategories,handlePageChange,setSort,applyFilters,handleSearch,handleCategoryDelete} = useProducts();

  return (
    <Box sx={{ mt: 3, px: { xs: 2, sm: 4 } }}>
      <SearchBar onSearch={handleSearch} />

      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box display="flex" flexWrap="wrap" gap={1}>
          {selectedCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              onDelete={() => handleCategoryDelete(category)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>

        <Box display="flex" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120, mx: 2 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sort}
              label="Sort By"
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <MenuItem key={opt} value={opt.toLowerCase().replace(" ", "-")}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FilterModal
            onApply={applyFilters}
            initialCategories={selectedCategories}
          />
        </Box>
      </Box>

      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" align="center">
          {(error as Error)?.message || "Failed to load products."}
        </Typography>
      ) : (
        <>
          <Grid
            container
            spacing={{ xs: 5, md: 4 }}
            justifyContent={{ xs: "center", md: "flex-start" }}
            alignItems="stretch"
            sx={{ mb: { xs: 6, md: 8 } }}
          >
            {data?.products.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center">No products found.</Typography>
              </Grid>
            ) : (
              data?.products.map((product: Product) => (
                <Grid
                  sx={{ xs: "none", mb: 3 }}
                  key={product._id}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  display="flex"
                  justifyContent="center"
                >
                  <Box sx={{ height: "100%" }}>
                    <ProductCard product={product} userView={true} />
                  </Box>
                </Grid>
              ))
            )}
          </Grid>

          {data && data.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mb={3}>
              <Pagination
                count={data.totalPages}
                page={data.currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
