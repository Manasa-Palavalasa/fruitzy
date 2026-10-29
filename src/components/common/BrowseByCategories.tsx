import { Grid, Tab, Tabs, Typography, Button } from "@mui/material";
import React from "react";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import ProductCard from "./ProductCard";
import { CATEGORY_TABS } from "../../../static/category";
import { Product } from "@/types";
import { useBrowseByCategories } from "@/hooks/useBrowseByCategories.hooks";

export default function BrowseByCategories() {
  const {category,handleChange,showAll,filteredProducts,productsToShow,isError,isLoading} = useBrowseByCategories();

  const router = useRouter();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error Loading the Products</p>;

  return (
    <Box sx={{ mt: 2, ml: 1 }}>
      <Typography color="primary" variant="h4" align="center" sx={{ p: 3 }}>
        Fruits
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tabs
          value={category}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="category tabs"
          sx={{ display: "flex", justifyContent: "center", mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {CATEGORY_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <Grid
        container
        spacing={0.2}
        justifyContent={{ xs: "center", sm: "flex-start" }}
      >
        {productsToShow.map((product: Product) => (
          <Grid
            key={product._id}
            item
            sm={12}
            md={4}
            sx={{
              mb: { xs: 6, md: 0 },
            }}
          >
            <ProductCard product={product} userView={true} />
          </Grid>
        ))}
      </Grid>

      {!showAll && filteredProducts.length > 3 && (
        <Box display="flex" justifyContent="center" mt={6}>
          <Button variant="contained" onClick={() => router.push("/products")}>
            Show More
          </Button>
        </Box>
      )}
    </Box>
  );
}
