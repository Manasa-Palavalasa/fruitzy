import { UseMutationResult } from "@tanstack/react-query";
import { ReactNode } from "react";

export interface LayoutProps {
  children: ReactNode; 
}


export interface productRatingType {
     _id: string;
  user: string;
  rating: number;
  review: string;
  createdAt: string;
  }



export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  categories: string[];
  price: number;
  stock: number;
  ratings: productRatingType[];
  averageRating: number;
  isPopular: boolean;
}



// CartItem type
export interface CartItemType {
  product: Product;
  quantity: number;  
}

// Cart type
export interface Cart {
  user: string; // userId 
  items: CartItemType[];
}


export interface CartProps {
  cart: Cart;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}



export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}


export interface AddressType {
  _id: string;
  label: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

export interface UserProfileType extends User{
  addresses: AddressType[];
}


export interface ProductFormProps {
  initialValues?: Partial<Product>;
  onSubmit: (values: FormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean; 
}


export interface AddressFormProps {
  onSubmit: (address: {
    label: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
  }) => void;
  onCancel: () => void;
}


export interface ProductsGridProps {
  products: Product[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}


export interface UserCardProps {
  user: User;
  onPromote: (user: User) => void;
}


export interface UsersGridProps {
  users: User[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPromote: (user: User) => void;
}


export interface CartSummaryProps {
  items: CartItemType[];
  onCheckout: () => void;
}


export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  userView?: boolean;
}

export interface AddReviewProps {
    mutation: UseMutationResult<unknown, unknown, { rating: number; review: string }>;
    setPage: (page: number) => void;
}

export interface ReviewsProps {
    productId: string;
    page: number;
    setPage: (page: number) => void;
}


export interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  placeholder?: string;
  showButton?: boolean;
}


export type FilterProps = {
  initialCategories: string[];
  onApply: (categories: string[]) => void;
};


export interface AddressProps {
  addresses: AddressType[];
  onDelete: (id: string) => void;
}

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  totalItems: number;
}


export interface CartListProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}


export interface APIError {
  response?: {
    data?: {
      message?: string;
    };
  };
}


export type OrderType = {
  _id: string;
  user?: {
    name?: string;
    email?: string;
  };
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
};

export type GetAllOrdersResponse = {
  orders: OrderType[];
  totalPages: number;
  currentPage: number;
};


export interface AlertModalProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}


export interface GetProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}