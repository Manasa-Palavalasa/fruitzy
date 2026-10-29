import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useAuth } from "@/contexts/AuthContext";
import * as cartHandler from "@/utils/updateCart";
import { ProductCardProps } from "@/types";
import ProductCard from "./ProductCard";
import { ThemeContextProvider } from "@/contexts/ThemeContext";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const product = {
  _id: "abc123",
  slug: "banana",
  name: "Banana",
  price: 45,
  description: "Fresh yellow bananas from the farm.",
  categories: ["Fruit", "Yellow", "Tropical", "Healthy"],
  stock: 10,
  images: [
    "https://example.com/banana1.jpg",
    "https://example.com/banana2.jpg"
  ],
  averageRating: 4.5,
  ratings: [
    {
      _id: "r1",
      user: "user1",
      rating: 5,
      comment: "Great bananas!",
      review: "Great bananas!",
      createdAt: new Date().toISOString()
    },
    {
      _id: "r2",
      user: "user2",
      rating: 4,
      comment: "Very fresh.",
      review: "Very fresh.",
      createdAt: new Date().toISOString()
    }
  ],
  isPopular: true,
};

const setup = (customProps: Partial<ProductCardProps> = {}, role = "user") => {
  (useAuth as jest.Mock).mockReturnValue({ role });
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  render(
    <ThemeContextProvider>
        <ProductCard
        product={product}
        onEdit={onEdit}
        onDelete={onDelete}
        {...customProps}
        />
    </ThemeContextProvider>
  );
  return { onEdit, onDelete };
};

describe("ProductCard", () => {
  let handleAddToCartMock: jest.Mock;
  let useCartHandlerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    handleAddToCartMock = jest.fn();
    useCartHandlerSpy = jest.spyOn(cartHandler, "useCartHandler").mockReturnValue({
      handleAddToCart: handleAddToCartMock,
    });
  });

  afterEach(() => {
    useCartHandlerSpy.mockRestore();
  });

  it("renders product details", () => {
    setup();
    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(/fresh yellow bananas/i)).toBeInTheDocument();
    expect(screen.getByText("Fruit")).toBeInTheDocument();
    expect(screen.getByText("Yellow")).toBeInTheDocument();
    expect(screen.getByText("Tropical")).toBeInTheDocument();
    expect(screen.getByText("+1 more")).toBeInTheDocument();
    expect(screen.getByText(/₹45/)).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("renders as a link for user view", () => {
    setup();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/products/${product._id}`);
    expect(link).toContainElement(screen.getByText(product.name));
  });

  it("shows Add to Cart for users and calls handleAddToCart", () => {
    setup();
    const addBtn = screen.getByRole("button", { name: /add to cart/i });
    expect(addBtn).toBeEnabled();
    fireEvent.click(addBtn);
    expect(handleAddToCartMock).toHaveBeenCalledWith(product._id);
  });

  it("disables Add to Cart if out of stock", () => {
    setup({ product: { ...product, stock: 0 } });
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeDisabled();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("shows admin buttons and calls onEdit/onDelete", () => {
    const { onEdit, onDelete } = setup({}, "admin");
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(product);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(product);
  });

  it("does not render as a link for admin view", () => {
    setup({}, "admin");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows 'In stock : X' for admin view", () => {
    setup({}, "admin");
    expect(screen.getByText(/In stock : 10/)).toBeInTheDocument();
  });

  it("renders truncated description if too long", () => {
    setup({
      product: { ...product, description: "a".repeat(60) },
    });
    expect(screen.getByText(/a{35}\.\.\./i)).toBeInTheDocument();
  });
});
