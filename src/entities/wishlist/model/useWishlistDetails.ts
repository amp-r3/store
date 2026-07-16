import { useMemo } from 'react';
import { Product } from '@/entities/product';
import { useAppSelector } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { WishlistData, useGetWishlistQuery, selectFavoritesArray } from '@/entities/wishlist';
import { selectIsAuth } from "@/entities/session";

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
    totalQuantity: unifiedWishlistItems.length,
  };
};