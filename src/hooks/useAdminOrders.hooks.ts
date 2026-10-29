import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/services/admin';

export const useAdminOrders = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-orders',page],
    queryFn: () => getAllOrders(page),
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return {
    page,
    setPage,
    data,
    isLoading,
    isError,
    handlePageChange,
  };
};
