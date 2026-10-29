import React from "react";
import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBrowseByCategories } from "@/hooks/useBrowseByCategories.hooks";
import * as productService from "@/services/product";

jest.mock("@/services/product", () => ({
  getProducts: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

beforeEach(() => {
  (productService.getProducts as jest.Mock).mockResolvedValue({
    products: [
      { id: 1, name: "Apple", categories: ["fruits"] },
      { id: 2, name: "Carrot", categories: ["vegetables"] },
      { id: 3, name: "Banana", categories: ["fruits"] },
      { id: 4, name: "Tomato", categories: ["vegetables"] },
    ],
  });
});

describe("useBrowseByCategories", () => {
  it("returns all products in the default Fruits overview", async () => {
    const { result } = renderHook(() => useBrowseByCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredProducts).toEqual([
      { id: 1, name: "Apple", categories: ["fruits"] },
      { id: 2, name: "Carrot", categories: ["vegetables"] },
      { id: 3, name: "Banana", categories: ["fruits"] },
      { id: 4, name: "Tomato", categories: ["vegetables"] },
    ]);
  });

  it("changes category and filters products", async () => {
    const { result } = renderHook(() => useBrowseByCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setCategory("vegetables");
    });

    expect(result.current.filteredProducts).toEqual([
      { id: 2, name: "Carrot", categories: ["vegetables"] },
      { id: 4, name: "Tomato", categories: ["vegetables"] },
    ]);
  });

  it("shows all filtered products when showAll is true", async () => {
    const { result } = renderHook(() => useBrowseByCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setShowAll(true);
    });

    expect(result.current.filteredProducts).toEqual([
      { id: 1, name: "Apple", categories: ["fruits"] },
      { id: 2, name: "Carrot", categories: ["vegetables"] },
      { id: 3, name: "Banana", categories: ["fruits"] },
      { id: 4, name: "Tomato", categories: ["vegetables"] },
    ]);
  });
});


