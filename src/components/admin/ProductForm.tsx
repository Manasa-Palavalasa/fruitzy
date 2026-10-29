import { Box, Button, Chip, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { ProductFormProps } from "@/types";
import { useProductForm } from "@/hooks/useProductForm.hooks";
import React from "react";

export default function ProductForm({ initialValues, onSubmit, onCancel, isEdit }: ProductFormProps) {
  const { formik, categoryInputRef, handleAddCategory, handleCategoryKeyDown } = useProductForm({
    initialValues,
    onSubmit,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isEdit ? "Edit Product" : "Add Product"}
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Slug"
              name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={formik.touched.slug && Boolean(formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              multiline
              rows={3}
              fullWidth
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Product image URL" name="image" value={formik.values.image} onChange={formik.handleChange} helperText="Local image path or an https://images.unsplash.com image URL" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Add Category"
                size="small"
                inputRef={categoryInputRef}
                onKeyDown={handleCategoryKeyDown}
                fullWidth
                placeholder="Press Enter to add"
              />
              <Button variant="contained" color="primary" onClick={handleAddCategory} sx={{ minWidth: 80 }}>
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              {formik.values.categories.map((cat, idx) => (
                <Chip
                  key={idx}
                  label={cat}
                  onDelete={() => {
                    const newCats = formik.values.categories.filter((_, index) => index !== idx);
                    formik.setFieldValue("categories", newCats);
                    formik.setFieldTouched("categories", true);
                  }}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            {formik.touched.categories && formik.errors.categories && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                {formik.errors.categories as string}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
              required
              inputProps={{ min: 1, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Stock"
              name="stock"
              type="number"
              value={formik.values.stock}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={formik.touched.stock && Boolean(formik.errors.stock)}
              helperText={formik.touched.stock && formik.errors.stock}
              required
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Is Popular"
              name="isPopular"
              value={formik.values.isPopular ? "true" : "false"}
              onChange={(e) => formik.setFieldValue("isPopular", e.target.value === "true")}
              onBlur={formik.handleBlur}
              fullWidth
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                {isEdit ? "Update" : "Add"}
              </Button>
              <Button onClick={onCancel} variant="outlined" color="secondary" disabled={formik.isSubmitting}>
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
