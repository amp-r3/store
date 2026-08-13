import { useMemo } from 'react';
import { useAppSelector } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { calculateCartTotals } from '@/entities/cart';
import { selectCheckoutItemsArray } from './checkoutSelectors';
import { CartItemDetails, CartProduct } from '@/entities/cart';
import { joinCheckoutDetails } from './joinCheckoutDetails';

interface CheckoutDetailsReturn {
  checkoutItems: CartProduct[];
  checkoutDetails: (CartItemDetails | null)[];
  totals: ReturnType<typeof calculateCartTotals>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useCheckoutDetails = (freeShippingThreshold: number | null): CheckoutDetailsReturn => {
  const checkoutItems = useAppSelector(selectCheckoutItemsArray);

  const productIds = useMemo(
    () => checkoutItems.map((item: CartProduct) => item.productId),
    [checkoutItems],
  );

  const {
    products,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
  } = useProductsByIds(productIds, true);

  const checkoutDetails = useMemo(
    () => joinCheckoutDetails(checkoutItems, products),
    [products, checkoutItems],
  );

  const totals = useMemo(() => {
    const validItems = checkoutDetails.filter(
      (item: CartItemDetails | null): item is CartItemDetails => item !== null,
    );

    return calculateCartTotals(validItems, freeShippingThreshold);
  }, [checkoutDetails, freeShippingThreshold]);

  return {
    checkoutItems,
    checkoutDetails,
    totals,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
    isEmpty: checkoutItems.length === 0,
  };
};
