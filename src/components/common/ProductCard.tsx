import { useAuth } from "@/contexts/AuthContext";
import { ProductCardProps } from "@/types";
import React from "react";
import {
  Card, CardContent, CardMedia, Typography,
  CardActions, Button, Chip, Stack
} from "@mui/material";
import Link from "next/link";
import { useCartHandler } from "../../utils/updateCart";
import { useRole } from "@/hooks/useRole.hooks";
import useProductCardStyles from "./ProductCard.styles";

export default function ProductCard({ product, onEdit, onDelete, userView }: ProductCardProps) {
  const { role } = useAuth();
  const { handleAddToCart } = useCartHandler();
  const { isAdmin } = useRole();
  const classes = useProductCardStyles();

  const isAdminView = isAdmin && !userView;
  const isUserView = !isAdminView;

  const CardContentArea = (
    <Card className={classes.card}>
      <CardMedia
        component="img"
        image={product.images?.[0] || `/${product.slug}.jpg`}
        alt={product.name}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = '/banner1.jpg';
        }}
        loading="lazy"
        height={180}
      />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {product?.description
            ? product.description.length > 35
              ? product.description.slice(0, 35) + '...'
              : product.description
            : ''}
        </Typography>
        <Stack direction="row" spacing={1} className={classes.categoryStack}>
          {product.categories.slice(0, 3).map((cat) => (
            <Chip key={cat} label={cat} size="small" />
          ))}
          {product.categories.length > 3 && (
            <Chip label={`+${product.categories.length - 3} more`} size="small" />
          )}
        </Stack>
        <Typography variant="body1" className={classes.price}>₹{product.price}</Typography>
        <Typography variant="caption" color={product.stock > 0 ? "success.main" : "error.main"}>
          {product.stock > 0
            ? role === 'admin'
              ? `In stock : ${product.stock}`
              : "In stock"
            : "Out of stock"}
        </Typography>
      </CardContent>
      <CardActions>
        {isAdminView ? (
          <>
            <Button size="small" onClick={() => onEdit && onEdit(product)}>Edit</Button>
            <Button size="small" color="error" onClick={() => onDelete && onDelete(product)}>Delete</Button>
          </>
        ) : (
          (role !== 'admin') && (
            <Button
              variant="contained"
              color="info"
              size="small"
              disabled={product.stock === 0}
              onClick={async (e) => {
                e.preventDefault();
                handleAddToCart(product._id);
              }}
            >
              Add to Cart
            </Button>
          )
        )}
      </CardActions>
    </Card>
  );

  return isUserView ? (
    <Link
      href={`/products/${product._id}`}
      passHref
      className={classes.link}
    >
      {CardContentArea}
    </Link>
  ) : (
    CardContentArea
  );
}
