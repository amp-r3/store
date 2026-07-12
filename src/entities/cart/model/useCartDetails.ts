import { useMemo } from 'react';
import { Product } from '@/entities/product/model/types';
import { CartData, CartItemDetails as CartItem } from '@/entities/cart/model/types';
import { useAppSelector } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { calculateCartTotals } from '../lib/cartHelper';
import { selectCartItemsArray, useGetCartQuery } from "@/entities/cart";
import { CartProduct } from "@/entities/cart/model/cartSelectors";
import { selectIsAuth } from "@/entities/session";
import { useGetDeliveryMethodsQuery } from "@/features/checkout-process";

interface CartDetailsReturn {
  cartDetails: (CartItem | null)[];
  cartItems: CartProduct[];
  refetchCart: RefetchType;
  totalQuantity: number | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
  totals: ReturnType<typeof calculateCartTotals>;
}

type RefetchType = () => void;

export const useCartDetails = (
  isOpen: boolean = true,
): CartDetailsReturn => {
  const isAuth = useAppSelector(selectIsAuth);
  const localCartItems = useAppSelector(selectCartItemsArray);

  const { data, isLoading: isCartLoading, isError: isCartError, isFetching: isCartFetching, refetch } =
    useGetCartQuery(undefined, { skip: !isAuth });
  const { data: deliveryMethods, isLoading: isDeliveryLoading, isFetching: isDeliveryFetching, isError: isDeliveryError } = useGetDeliveryMethodsQuery();

  const freeShippingThreshold = deliveryMethods?.find(
    (method: any) => method && method.freeFromPrice > 0
  )?.freeFromPrice ?? null;

  const unifiedCartItems = useMemo(() => {
    if (isAuth && data) {
      return (Object.entries(data) as [string, CartData][]).map(
        ([sizeId, info]) => ({
          sizeId: Number(sizeId),
          productId: info.productId,
          quantity: info.quantity,
        })
      );
    }
    return localCartItems;
  }, [isAuth, data, localCartItems]);

  const productIds = useMemo(
    () => unifiedCartItems.map(item => item.productId),
    [unifiedCartItems]
  );

  const { products, isLoading: isProductsLoading, isFetching: isProductsFetching, isError: isProductsError } =
    useProductsByIds(productIds, isOpen);

  const cartDetails = useMemo(() => {
    const productsMap = products.reduce<Record<number, Product>>((acc: any, product: any) => {
      acc[product.id] = product;
      return acc;
    }, {});

    return unifiedCartItems.map((item: any) => {
      const serverProduct = productsMap[item.productId];
      if (!serverProduct) return null;

      return {
        ...serverProduct,
        sizeId: item.sizeId,
        quantity: item.quantity,
      };
    });
  }, [products, unifiedCartItems]);

  const totalQuantity = useMemo(() =>
    unifiedCartItems.reduce((acc: any, item: any) => acc + item.quantity, 0),
    [unifiedCartItems]
  );

  const totals = useMemo(() => {
    const validItems = cartDetails.filter((item: any): item is CartItem => item !== null);

    return calculateCartTotals(validItems, freeShippingThreshold);
  }, [cartDetails, freeShippingThreshold]);

  return {
    cartItems: unifiedCartItems,
    cartDetails,
    totalQuantity,
    totals,
    refetchCart: refetch,
    isLoading: isCartLoading || isProductsLoading || isDeliveryLoading,
    isFetching: isCartFetching || isProductsFetching || isDeliveryFetching,
    isError: isCartError || isProductsError || isDeliveryError,
    isEmpty: unifiedCartItems.length === 0,
  };
};