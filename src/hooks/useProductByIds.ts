import { useGetProductArrayByIdQuery } from '@/services/productsApi';
import { Product } from '@/types/products';

interface ProductsFetchReturn {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const useProductsByIds = (ids: string[], isOpen: boolean = true): ProductsFetchReturn => {
  const { data: products = [], isLoading, isError, isFetching } = useGetProductArrayByIdQuery(
    ids, 
    { skip: !isOpen || ids.length === 0 }
  );

  return {
    products,
    isLoading: isLoading,
    isFetching: isFetching,
    isError,
  };
};