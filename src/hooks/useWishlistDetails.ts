import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useProductsByIds } from './useProductByIds';
import { Product } from '@/types/products';
import { WishlistData, selectFavoritesArray } from '@/store/selectors/wishlistSelectors';

interface WishlistDetailsReturn {
  wishlistDetails: Product[];
  wishlistItems: WishlistData[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useWishlistDetails = (isOpen: boolean = true): WishlistDetailsReturn => {
  const wishlistItems = useSelector(selectFavoritesArray);
  
  const productIds = useMemo(
    () => wishlistItems.map(item => item.id), 
    [wishlistItems]
  );

  const { products, isLoading, isError, isFetching } = useProductsByIds(productIds, isOpen);

  return {
    wishlistDetails: products, 
    wishlistItems,                  
    isLoading, 
    isFetching,
    isError,
    isEmpty: wishlistItems.length === 0,
  };
};