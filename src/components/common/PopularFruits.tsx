import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Product } from "@/types";
import { getProducts } from "@/services/product";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function PopularFruits() {

    const fetchPopularProducts = async () => {
        const { products } = await getProducts(); 
        return products.filter((product: Product) => product.isPopular).slice(0,3);
    };

  const {data:popularProducts = [],isLoading,isError} = useQuery({
    queryKey:['popularProducts'],
    queryFn:fetchPopularProducts,
  });


  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error Loading the Products</p>;

  return (
    <Box sx={{ mt: 2,ml:1 }}>
      <Typography color="primary" variant="h4" align="center" sx={{ p: 3 }}>
        Popular Fruits
      </Typography>

      <Grid container spacing={0.2} justifyContent="center">
        {popularProducts.map((product: Product) => (
            <Grid
            key={product._id}
            item
            sm={12}
            md={4}
            sx={{mb: { xs: 6, md: 0 }}} >
            <ProductCard product={product} userView={true} />
            </Grid>
        ))}
      </Grid>
    </Box>
  );
}
