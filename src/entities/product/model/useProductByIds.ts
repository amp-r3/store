import { Product } from '@/entities/product/model/types';
import { useGetProductArrayByIdQuery } from '../api/productsApi';

interface ProductsFetchReturn {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const useProductsByIds = (ids: number[], isOpen: boolean = true): ProductsFetchReturn => {
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