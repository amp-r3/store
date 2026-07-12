import { useMemo } from 'react';
import { Product } from '@/entities/product';
import { useAppSelector } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { calculateCartTotals } from '@/entities/cart';
import { selectCheckoutItemsArray } from "@/features/checkout-process";
import { CartItemDetails, CartProduct } from "@/entities/cart";
import { useGetDeliveryMethodsQuery } from '../api/checkoutApi';

interface CheckoutDetailsReturn {
  checkoutItems: CartProduct[];
  checkoutDetails: (CartItemDetails | null)[];
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
    (method: any) => method && method.freeFromPrice > 0
  )?.freeFromPrice ?? null;

  const productIds = useMemo(
    () => checkoutItems.map((item: CartProduct) => item.productId),
    [checkoutItems]
  );

  const { products, isLoading: isProductsLoading, isFetching: isProductsFetching, isError: isProductsError } =
    useProductsByIds(productIds, true);

  const checkoutDetails = useMemo(() => {
    const productsMap = products.reduce<Record<number, Product>>((acc: Record<number, Product>, product: Product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    return checkoutItems.map((item: CartProduct) => {
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
    const validItems = checkoutDetails.filter((item: CartItemDetails | null): item is CartItemDetails => item !== null);

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
