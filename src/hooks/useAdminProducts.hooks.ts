import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addProduct, updateProduct, deleteProduct } from "@/services/admin";
import { getProducts } from "@/services/product";
import { Product } from "@/types";
import { toast } from "react-toastify";
import { useModal } from "@/contexts/ModalProvider";

export function useAdminProducts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const {confirm} = useModal();

  const queryClient = useQueryClient();


  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", { search, page }],
    queryFn: () => getProducts({ search, page, limit: 9 }),
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added.");
      setOpenForm(false);
    },
    onError: () => toast.error("Failed to add product."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated.");
      setOpenForm(false);
    },
    onError: () => toast.error("Failed to update product."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted.");
    },
    onError: () => toast.error("Failed to delete product."),
  });

  const handleAdd = () => {
    setEditingProduct(null);
    setOpenForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (await confirm("Delete this product?")) {
      deleteMutation.mutate(product._id);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (editingProduct) await updateMutation.mutateAsync({ id: editingProduct._id, formData });
      else await addMutation.mutateAsync(formData);
    } catch { /* onError displays the request failure and keeps the form open. */ }
  };

  return {
    products,
    isLoading,
    isError,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    editingProduct,
    openForm,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    setOpenForm,
  };
}
