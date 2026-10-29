import { LoginSchema, SignupSchema } from "./auth";

describe('SignupSchema Validation', () => {
  it('should pass with valid data', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '123456',
    };

    await expect(SignupSchema.validate(validData)).resolves.toBeTruthy();
  });

  it('should fail if name is missing', async () => {
    const data = {
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '123456',
    };

    await expect(SignupSchema.validate(data)).rejects.toThrow('Name is required');
  });

  it('should fail if email is invalid', async () => {
    const data = {
      name: 'John',
      email: 'invalid-email',
      password: '123456',
      confirmPassword: '123456',
    };

    await expect(SignupSchema.validate(data)).rejects.toThrow('Invalid email');
  });

  it('should fail if password is too short', async () => {
    const data = {
      name: 'John',
      email: 'john@example.com',
      password: '123',
      confirmPassword: '123',
    };

    await expect(SignupSchema.validate(data)).rejects.toThrow('Minimum 6 characters');
  });

  it('should fail if passwords do not match', async () => {
    const data = {
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '654321',
    };

    await expect(SignupSchema.validate(data)).rejects.toThrow('Passwords must match');
  });
});

describe('LoginSchema Validation', () => {
  it('should pass with valid data', async () => {
    const validData = {
      email: 'user@example.com',
      password: 'securePassword',
    };

    await expect(LoginSchema.validate(validData)).resolves.toBeTruthy();
  });

  it('should fail if email is missing', async () => {
    const data = {
      password: '123456',
    };

    await expect(LoginSchema.validate(data)).rejects.toThrow('Email is required');
  });

  it('should fail if email is invalid', async () => {
    const data = {
      email: 'invalidemail',
      password: '123456',
    };

    await expect(LoginSchema.validate(data)).rejects.toThrow('Invalid email');
  });

  it('should fail if password is missing', async () => {
    const data = {
      email: 'user@example.com',
    };

    await expect(LoginSchema.validate(data)).rejects.toThrow('Password is required');
  });
});
