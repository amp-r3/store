import { useMemo } from 'react';
import { useProductsByIds } from './useProductByIds';
import { Product } from '@/types/products';
import { WishlistData, selectFavoritesArray } from '@/store/selectors/wishlistSelectors';
import { useAppSelector } from './redux';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { useGetWishlistQuery } from '@/services/wishlistApi';

interface WishlistDetailsReturn {
  wishlistDetails: Product[];
  wishlistItems: WishlistData[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useWishlistDetails = (): WishlistDetailsReturn => {
  const isAuth = useAppSelector(selectIsAuth)
  const localWishlistItems = useAppSelector(selectFavoritesArray);

  const { data, isLoading: isWishlistLoading, isError: isWishlistError, isFetching: isWishlistFetching } = useGetWishlistQuery(undefined, { skip: !isAuth });

  const unifiedWishlistItems = useMemo(
    () => {
      if (isAuth && data) {
        return (Object.entries(data) as [string, boolean][]).map(
          ([id]) => ({
            id: Number(id)
          })
        );
      }
      return localWishlistItems
    }, [isAuth, data, localWishlistItems]);


  const productIds = useMemo(
    () => unifiedWishlistItems.map(item => item.id),
    [unifiedWishlistItems]
  );

  const { products, isLoading: isProductsLoading, isFetching: isProductsFetching, isError: isProductsError } = useProductsByIds(productIds);

  return {
    wishlistDetails: products,
    wishlistItems: unifiedWishlistItems,
    isLoading: isWishlistLoading || isProductsLoading,
    isFetching: isWishlistFetching || isProductsFetching,
    isError: isWishlistError || isProductsError,
    isEmpty: unifiedWishlistItems.length === 0,
  };
};