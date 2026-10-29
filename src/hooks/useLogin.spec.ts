import { renderHook, act } from '@testing-library/react';
import { useLogin } from '@/hooks/useLogin.hooks';
import { login as loginService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

jest.mock('@/services/auth');
jest.mock('@/contexts/AuthContext');
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('useLogin', () => {
  const mockLogin = loginService as jest.Mock;
  const mockPush = jest.fn();
  const mockAuthLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ login: mockAuthLogin });
  });

  it('should initialize formik with default values', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.formik.values).toEqual({
      email: '',
      password: ''
    });
  });

  it('should toggle password visibility', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.showPassword).toBe(false);
    act(() => {
      result.current.setShowPassword(true);
    });
    expect(result.current.showPassword).toBe(true);
  });

  it('should login and redirect based on role', async () => {
    const mockResponse = {
      token: 'fake-token',
      user: { role: 'admin' }
    };
    mockLogin.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.formik.setValues({
        email: 'admin@example.com',
        password: 'adminpass'
      });
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'adminpass');
    expect(mockAuthLogin).toHaveBeenCalledWith('fake-token', 'admin');
    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should handle login error', async () => {
    const error = {
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    };
    mockLogin.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.formik.setValues({
        email: 'test@example.com',
        password: 'wrongpass'
      });
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpass');
    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Invalid credentials'
    });
  });

  it('should fallback to generic error if no response message', async () => {
    const error = {};
    mockLogin.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.formik.setValues({
        email: 'any@example.com',
        password: 'anypass'
      });
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Login failed'
    });
  });
});
