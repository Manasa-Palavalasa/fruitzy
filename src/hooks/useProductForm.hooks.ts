import { useFormik } from "formik";
import { useRef } from "react";
import { ProductFormProps } from "@/types";
import { ProductSchema } from "@/schemas/admin";

export const useProductForm = ({ initialValues, onSubmit }: Pick<ProductFormProps, "initialValues" | "onSubmit">) => {
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || "",
      slug: initialValues?.slug || "",
      description: initialValues?.description || "",
      image: initialValues?.images?.[0] || "/banner1.jpg",
      categories: initialValues?.categories || [],
      price: typeof initialValues?.price === "number" ? initialValues.price : "",
      stock: typeof initialValues?.stock === "number" ? initialValues.stock : "",
      isPopular: initialValues?.isPopular || false,
    },
    validationSchema: ProductSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("description", values.description);
      formData.append("image", values.image);
      values.categories.forEach((cat) => formData.append("categories", cat));
      formData.append("price", String(values.price));
      formData.append("stock", String(values.stock));
      formData.append("isPopular", values.isPopular ? "true" : "false");

      try { await onSubmit(formData); } finally { setSubmitting(false); }
    },
  });

  const handleAddCategory = () => {
    const value = categoryInputRef.current?.value?.trim();
    if (value && !formik.values.categories.includes(value)) {
      formik.setFieldValue("categories", [...formik.values.categories, value]);
      formik.setFieldTouched("categories", true);
    }
    if (categoryInputRef.current) categoryInputRef.current.value = "";
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return { formik, categoryInputRef, handleAddCategory, handleCategoryKeyDown };
};
