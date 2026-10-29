import { addressSchema, ReviewSchema } from "./user";

describe('addressSchema minimal tests', () => {
  const validAddress = {
    label: 'Home',
    address: '456 Main Street',
    pincode: '600001',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
  };

  const invalidAddress = {
    label: 'Home',
    address: '456 Main Street',
    pincode: '600001',
    city: 'Chennai',
    country: 'India',
  };

  it('should pass with valid address data', async () => {
    await expect(addressSchema.validate(validAddress)).resolves.toBeTruthy();
  });

  it('should fail when label and state are missing', async () => {
    await expect(addressSchema.validate(invalidAddress)).rejects.toThrow('Please select a valid Indian state');
  });
});

describe('ReviewSchema', () => {
  const validReview = {
    rating: 5,
    review: 'Absolutely amazing!',
  };

  const invalidReview = {
    // Missing: rating, review
  };

  it('should pass with valid review data', async () => {
    await expect(ReviewSchema.validate(validReview)).resolves.toBeTruthy();
  });

  it('should fail when rating and review are missing', async () => {
    await expect(ReviewSchema.validate(invalidReview)).rejects.toThrow('Required');
  });
});
