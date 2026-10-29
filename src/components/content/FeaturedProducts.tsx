import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { getProductByID } from "@/services/product";
import type { Product } from "@/types";
import ProductCard from "@/components/common/ProductCard";

export default function FeaturedProducts({ ids }: { ids: string[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled(ids.map(id => getProductByID(id))).then(results => {
      if (!active) return;
      setProducts(results.flatMap(result => result.status === "fulfilled" && result.value ? [result.value] : []));
      setFailed(ids.filter((_, index) => results[index].status === "rejected"));
      setLoading(false);
    });
    return () => { active = false; };
  }, [ids]);
  if (!ids.length) return null;
  return <section aria-label="Featured products">
    <Typography variant="h5" component="h2" gutterBottom>Featured products</Typography>
    {loading ? <CircularProgress aria-label="Loading featured products" /> : <>
      <Grid container spacing={2}>{products.map(product => <Grid item xs={12} sm={6} md={4} key={product._id}><ProductCard product={product} userView /></Grid>)}</Grid>
      {failed.length > 0 && <Alert severity="info" sx={{ mt: 2 }}>Some product details are temporarily unavailable. {failed.map((id, index) => <Button key={id} component={Link} href={`/products/${encodeURIComponent(id)}`}>View product {index + 1}</Button>)}</Alert>}
    </>}
  </section>;
}
