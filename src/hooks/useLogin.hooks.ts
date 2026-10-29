import { useState } from 'react';
import { useFormik } from 'formik';
import { LoginSchema } from '@/schemas/auth';
import { login } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { APIError } from '@/types';

export function useLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const auth = useAuth();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await login(values.email, values.password);
        auth.login(response.token, response.user.role);
        switch (response.user.role) {
          case 'admin':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
      } catch (error) {
        const err = error as APIError;
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Login failed'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  return {
    formik,
    showPassword,
    setShowPassword,
    message
  };
}
