import {Box, Grid, Typography, Rating, Chip, Stack, Button, Paper, useMediaQuery, useTheme, Link} from "@mui/material";
import Image from "next/image";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ReviewSection from "@/components/product/ReviewSection";
import { useProductDetails } from "@/hooks/useProductDetails.hooks";
import { useCartHandler } from "@/utils/updateCart";

export default function DetailedPage() {
  const {product,isError,isLoading,imgError,handleImageError,showAllCategories,toggleShowCategories} = useProductDetails();
  const { handleAddToCart } = useCartHandler();

  const { isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isError) return <Typography>Error Loading the Product...</Typography>;
  if (isLoading || !product) return <Typography>Loading...</Typography>;

  const visibleCategories = showAllCategories
    ? product.categories
    : product.categories.slice(0, 3);

  const imageSrc = imgError ? "/apple.jpg" : (product.images?.[0] || `/${product.slug}.jpg`);

  return (
    <Box p={isMobile ? 2 : 4}>
      <Grid container spacing={4} alignItems="stretch">

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: "100%", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 3, overflow: "hidden", minHeight: 500 }}>
            <Box sx={{ width: "100%", maxWidth: 400, display: "flex", justifyContent: "center" }}>
              <Image
                src={imageSrc}
                alt={product.name}
                width={isMobile ? 280 : 360}
                height={isMobile ? 240 : 360}
                style={{ borderRadius: 12, objectFit: "cover" }}
                loading="lazy"
                onError={handleImageError}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: "100%", minHeight: 500, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 3 }}>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold">
                {product.name}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                {visibleCategories.map((cat) => (
                  <Chip key={cat} label={cat} color="primary" />
                ))}
                {product.categories.length > 3 && (
                  <Link component="button" onClick={toggleShowCategories} sx={{ ml: 1 }}>
                    {showAllCategories ? "Show Less" : "Show More"}
                  </Link>
                )}
                {product.isPopular && (
                  <Chip label="Popular" color="secondary" />
                )}
              </Stack>

              <Typography variant="body1" mb={2} color="text.secondary" sx={{ maxHeight: 120, overflow: "auto", whiteSpace: "pre-line" }}>
                {product.description}
              </Typography>

              <Typography variant="h6" mb={1} color="green">
                ₹{product.price}
              </Typography>

              <Typography variant="body2" color={product.stock > 0 ? "success.main" : "error.main"} mb={2}>
                {product.stock > 0 ? (isAdmin ? `In stock : ${product.stock}` : "In stock") : "Out of stock"}
              </Typography>

              <Typography variant="body1" gutterBottom>Average Rating:</Typography>
              <Rating value={product.averageRating} precision={0.5} readOnly />
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={Boolean(product.stock === 0 || isAdmin)}
              onClick={() => handleAddToCart(product._id)}
              sx={{ mt: 3 }}
            >
              Add To Cart
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <ReviewSection productId={product._id} />
        </Grid>
      </Grid>
    </Box>
  );
}
