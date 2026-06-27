import { useMemo } from 'react';
import { selectCartItemsArray } from '@/store';
import { CartItem, Product, CartData } from '@/types/products';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { useAppSelector } from '../../common/redux';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { cartApi, useGetCartQuery } from '@/services/cartApi';
import { useProductsByIds } from '../product';
import { calculateCartTotals } from '@/utils';
import { useGetDeliveryMethodsQuery } from '@/services/checkoutApi';

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

type UseGetCartQueryResult = ReturnType<typeof cartApi.endpoints.getCart.Types>;
type RefetchType = UseGetCartQueryResult['refetch'];

export const useCartDetails = (
  isOpen: boolean = true,
): CartDetailsReturn => {
  const isAuth = useAppSelector(selectIsAuth);
  const localCartItems = useAppSelector(selectCartItemsArray);

  const { data, isLoading: isCartLoading, isError: isCartError, isFetching: isCartFetching, refetch } =
    useGetCartQuery(undefined, { skip: !isAuth });
  const { data: deliveryMethods, isLoading: isDeliveryLoading, isFetching: isDeliveryFetching, isError: isDeliveryError } = useGetDeliveryMethodsQuery();

  const freeShippingThreshold = deliveryMethods?.find(
    (method) => method && method.freeFromPrice > 0
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
    const productsMap = products.reduce<Record<number, Product>>((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    return unifiedCartItems.map((item) => {
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
    unifiedCartItems.reduce((acc, item) => acc + item.quantity, 0),
    [unifiedCartItems]
  );

  const totals = useMemo(() => {
    const validItems = cartDetails.filter((item): item is CartItem => item !== null);

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