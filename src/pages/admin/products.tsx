import { Box, Button, Dialog, DialogTitle, Typography, CircularProgress } from '@mui/material';
import SearchBar from "@/components/common/SearchBar";
import ProductsGrid from "@/components/admin/ProductsGrid";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProducts } from '@/hooks/useAdminProducts.hooks';
import { useAuthGuard } from '@/hooks/useAuthGuard.hooks';
import React from "react";

function AdminProductsPage() {
  const {products,isLoading,isError,search,setSearch,page,setPage,totalPages,editingProduct,openForm,handleAdd,handleEdit,handleDelete,handleFormSubmit,setOpenForm} = useAdminProducts();
  const { isAuthorized } = useAuthGuard({ roles: ["admin"] });

  if (!isAuthorized) return <div>Unauthorized</div>;

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress />
    </Box>
  );

  if (isError) return (
    <Typography color="error" align="center" sx={{ mt: 5 }}>
      Error loading products. Please try again later.
    </Typography>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>Manage Products</Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <SearchBar
            value={search}
            onChange={v => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search products..."
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mr: 5, mb: 2 }}>
          <Button variant="contained" onClick={handleAdd}>Add Product</Button>
        </Box>

        <ProductsGrid
          products={products}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth fullScreen>
          <DialogTitle align="center">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          <ProductForm
            initialValues={editingProduct || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(false)}
            isEdit={!!editingProduct}
          />
        </Dialog>
      </Box>
    </Box>
  );
}

export default AdminProductsPage;
