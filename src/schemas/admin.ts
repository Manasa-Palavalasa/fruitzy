import * as Yup from 'yup';


export const ProductSchema = Yup.object({
  name: Yup.string().required("Name is Required"),
  slug: Yup.string().required("Slug is Required"),
  description: Yup.string().required("Description is Required"),
  categories: Yup.array()
    .of(Yup.string().required("Category cannot be empty"))
    .min(1, "At least one category is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Required")
    .min(1, "Price must be at least 1"),
  stock: Yup.number()
    .typeError("Stock must be a number")
    .required("Required")
    .min(0, "Stock cannot be negative"),
  isPopular: Yup.boolean(),
});