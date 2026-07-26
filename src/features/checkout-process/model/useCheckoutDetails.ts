import { useMemo } from 'react';
import { Product } from '@/entities/product';
import { useAppSelector } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { calculateCartTotals } from '@/entities/cart';
import { selectCheckoutItemsArray } from "@/features/checkout-process";
import { CartItemDetails, CartProduct } from "@/entities/cart";

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
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
    isEmpty: checkoutItems.length === 0,
  };
};
