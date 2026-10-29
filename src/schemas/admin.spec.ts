import { ProductSchema } from "./admin";


describe('ProductSchema Validation', () => {
  it('should pass with valid data', async () => {
    const validData = {
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'A great product',
      categories: ['fruit'],
      price: 100,
      stock: 50,
      isPopular: true,
    };

    await expect(ProductSchema.validate(validData)).resolves.toBeTruthy();
  });

  it('should fail if name is missing', async () => {
    const data = {
      slug: 'sample-product',
      description: 'A great product',
      categories: ['fruit'],
      price: 100,
      stock: 50,
    };

    await expect(ProductSchema.validate(data)).rejects.toThrow('Name is Required');
  });

  it('should fail if price is not a number', async () => {
    const data = {
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'A great product',
      categories: ['fruit'],
      price: 'abc',
      stock: 50,
    };

    await expect(ProductSchema.validate(data)).rejects.toThrow('Price must be a number');
  });

  it('should fail if categories is empty', async () => {
    const data = {
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'A great product',
      categories: [],
      price: 100,
      stock: 50,
    };

    await expect(ProductSchema.validate(data)).rejects.toThrow('At least one category is required');
  });

  it('should fail if stock is negative', async () => {
    const data = {
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'A great product',
      categories: ['fruit'],
      price: 100,
      stock: -5,
    };

    await expect(ProductSchema.validate(data)).rejects.toThrow('Stock cannot be negative');
  });
});
