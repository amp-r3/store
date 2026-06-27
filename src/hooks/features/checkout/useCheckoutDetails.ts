import { useMemo } from 'react';
import { selectCheckoutItemsArray } from '@/store';
import { CartItem, Product } from '@/types/products';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { useAppSelector } from '../../common/redux';
import { useProductsByIds } from '../product';
import { calculateCartTotals } from '@/utils';
import { useGetDeliveryMethodsQuery } from '@/services/checkoutApi';

interface CheckoutDetailsReturn {
  checkoutItems: CartProduct[];
  checkoutDetails: (CartItem | null)[];
  totals: ReturnType<typeof calculateCartTotals>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useCheckoutDetails = (): CheckoutDetailsReturn => {
  const checkoutItems = useAppSelector(selectCheckoutItemsArray);
  const { data: deliveryMethods, isLoading: isDeliveryLoading, isFetching: isDeliveryFetching, isError: isDeliveryError } = useGetDeliveryMethodsQuery();

  const freeShippingThreshold = deliveryMethods?.find(
    (method) => method && method.freeFromPrice > 0
  )?.freeFromPrice ?? null;

  const productIds = useMemo(
    () => checkoutItems.map(item => item.productId),
    [checkoutItems]
  );

  const { products, isLoading: isProductsLoading, isFetching: isProductsFetching, isError: isProductsError } =
    useProductsByIds(productIds, true);

  const checkoutDetails = useMemo(() => {
    const productsMap = products.reduce<Record<number, Product>>((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    return checkoutItems.map((item) => {
      const serverProduct = productsMap[item.productId];
      if (!serverProduct) return null;

      return {
        ...serverProduct,
        sizeId: item.sizeId,
        quantity: item.quantity,
      };
    });
  }, [products, checkoutItems]);

  const totals = useMemo(() => {
    const validItems = checkoutDetails.filter((item): item is CartItem => item !== null);

    return calculateCartTotals(validItems, freeShippingThreshold);
  }, [checkoutDetails, freeShippingThreshold]);

  return {
    checkoutItems,
    checkoutDetails,
    totals,
    isLoading: isProductsLoading || isDeliveryLoading,
    isFetching: isProductsFetching || isDeliveryFetching,
    isError: isProductsError || isDeliveryError,
    isEmpty: checkoutItems.length === 0,
  };
};
