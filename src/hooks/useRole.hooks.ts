import { useAuth } from '../contexts/AuthContext';
import { useMemo } from 'react';

export const useRole = () => {
  const { role, isLoading } = useAuth();

  const { isAdmin, isUser } = useMemo(() => {
    if (isLoading) {
      return { isAdmin: null, isUser: null };
    }

    return {
      isAdmin: role === 'admin',
      isUser: role === 'user',
    };
  }, [role, isLoading]);

  return { isAdmin, isUser };
};
