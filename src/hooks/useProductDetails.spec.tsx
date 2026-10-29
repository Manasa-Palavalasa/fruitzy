import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as nextRouter from 'next/router';
import { useProductDetails } from './useProductDetails.hooks';
import { Product } from '@/types';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

import { useQuery } from '@tanstack/react-query';

const TestComponent = () => {
  const {
    productId,
    product,
    isLoading,
    isError,
    imgError,
    handleImageError,
    showAllCategories,
    toggleShowCategories,
  } = useProductDetails();

  return (
    <div>
      <div data-testid="productId">{productId}</div>
      <div data-testid="isLoading">{String(isLoading)}</div>
      <div data-testid="isError">{String(isError)}</div>
      <div data-testid="imgError">{String(imgError)}</div>
      <div data-testid="showAllCategories">{String(showAllCategories)}</div>
      <div data-testid="productName">{product?.name || ''}</div>
      <button onClick={handleImageError}>Trigger Img Error</button>
      <button onClick={toggleShowCategories}>Toggle Categories</button>
    </div>
  );
};

describe('useProductDetails', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(nextRouter, 'useRouter').mockReturnValue({
      query: { productId: '123' },
    } as unknown as nextRouter.NextRouter);
  });

  it('returns product data when available', () => {
    const mockProduct: Product = {
      _id: '123',
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      images: [],
      price: 100,
      stock: 10,
      categories: ['Test Category'],
      ratings: [],
      isPopular: false,
      averageRating: 3,
    };

    (useQuery as jest.Mock).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId('productId').textContent).toBe('123');
    expect(screen.getByTestId('productName').textContent).toBe('Test Product');
  });

  it('toggles image error and category states', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId('imgError').textContent).toBe('false');
    fireEvent.click(screen.getByText('Trigger Img Error'));
    expect(screen.getByTestId('imgError').textContent).toBe('true');

    expect(screen.getByTestId('showAllCategories').textContent).toBe('false');
    fireEvent.click(screen.getByText('Toggle Categories'));
    expect(screen.getByTestId('showAllCategories').textContent).toBe('true');
  });

  it('handles loading and error states', () => {
    (useQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
    });

    const { rerender } = render(<TestComponent />);
    expect(screen.getByTestId('isLoading').textContent).toBe('true');
    expect(screen.getByTestId('isError').textContent).toBe('false');

    (useQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: true,
    });

    rerender(<TestComponent />);
    expect(screen.getByTestId('isLoading').textContent).toBe('false');
    expect(screen.getByTestId('isError').textContent).toBe('true');
  });
});



