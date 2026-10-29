import { Grid, Box, Pagination, Typography } from "@mui/material";
import ProductCard from "../common/ProductCard";
import { ProductsGridProps } from "@/types";
import React from "react";


export default function ProductsGrid({products,totalPages,currentPage,onPageChange,onEdit,onDelete}: ProductsGridProps) {
  if (!products.length)
    return <Typography align="center">No products found.</Typography>;

  return (
    <Box>
      <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4} lg={4} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} />
              </Box>
            </Grid>
          ))}
        </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}