import { useState } from 'react';
import { useFormik } from 'formik';
import { SignupSchema } from '@/schemas/auth';
import { signup } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { APIError } from '@/types';

export function useSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning' | ''; text: string }>({ type: '', text: '' });
  const auth = useAuth();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: SignupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await signup(
          values.name,
          values.email,
          values.password,
        );
        setMessage({ type: 'success', text: 'Signup successful!' });
        auth.login(response.token, response.user.role);
      } catch (err) {
        const error = err as APIError;
        setMessage({ type: 'error', text: error.response?.data?.message || 'Signup failed' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return { formik, showPassword, setShowPassword, message };
}
