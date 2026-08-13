import { useMemo } from 'react';
import { Product } from '@/entities/product';
import { useAppSelector } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { selectIsAuth } from '@/entities/session';
import { WishlistData, selectFavoritesArray } from './wishlistSelectors';
import { useGetWishlistQuery } from '../api/wishlistApi';
import { unifyWishlist } from '../lib/unifyWishlist';

interface WishlistDetailsReturn {
  wishlistDetails: Product[];
  wishlistItems: WishlistData[];
  totalQuantity: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useWishlistDetails = (): WishlistDetailsReturn => {
  const isAuth = useAppSelector(selectIsAuth);
  const localWishlistItems = useAppSelector(selectFavoritesArray);

  const {
    data,
    isLoading: isWishlistLoading,
    isError: isWishlistError,
    isFetching: isWishlistFetching,
  } = useGetWishlistQuery(undefined, { skip: !isAuth });

  const unifiedWishlistItems = useMemo(
    () => unifyWishlist(isAuth, data, localWishlistItems),
    [isAuth, data, localWishlistItems],
  );

  const productIds = useMemo(
    () => unifiedWishlistItems.map((item) => item.id),
    [unifiedWishlistItems],
  );

  const {
    products,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
  } = useProductsByIds(productIds);

  return {
    wishlistDetails: products,
    wishlistItems: unifiedWishlistItems,
    isLoading: isWishlistLoading || isProductsLoading,
    isFetching: isWishlistFetching || isProductsFetching,
    isError: isWishlistError || isProductsError,
    isEmpty: unifiedWishlistItems.length === 0,
    totalQuantity: unifiedWishlistItems.length,
  };
};
