import { useMemo } from 'react';
import { selectCartItemsArray } from '@/store';
import { CartItem, Product } from '@/types/products';
import { useProductsByIds } from './useProductByIds';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { useAppSelector } from './redux';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { cartApi, useGetCartQuery } from '@/services/cartApi';

interface CartDetailsReturn {
  cartDetails: (CartItem | null)[];
  cartItems: CartProduct[];
  refetchCart: RefetchType;
  totalQuantity: number | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

type UseGetCartQueryResult = ReturnType<typeof cartApi.endpoints.getCart.useQuery>;
type RefetchType = UseGetCartQueryResult['refetch'];

export const useCartDetails = (isOpen: boolean = true): CartDetailsReturn => {
  const isAuth = useAppSelector(selectIsAuth);
  const localCartItems = useAppSelector(selectCartItemsArray);

  const { data, isLoading: isCartLoading, isError: isCartError, isFetching: isCartFetching, refetch } =
    useGetCartQuery(undefined, { skip: !isAuth });

  const unifiedCartItems = useMemo(() => {
    if (isAuth && data) {
      return (Object.entries(data) as [string, { quantity: number }][]).map(
        ([id, info]) => ({
          id: Number(id),
          quantity: info.quantity,
        })
      );
    }
    return localCartItems;
  }, [isAuth, data, localCartItems]);

  const productIds = useMemo(
    () => unifiedCartItems.map(item => item.id),
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
      const serverProduct = productsMap[item.id];
      if (!serverProduct) return null;

      return {
        ...serverProduct,
        quantity: item.quantity,
      };
    });
  }, [products, unifiedCartItems]);

  const totalQuantity = useMemo(() =>
    unifiedCartItems.reduce((acc, item) => acc + item.quantity, 0),
    [unifiedCartItems]
  );

  return {
    cartItems: unifiedCartItems,
    cartDetails,
    totalQuantity,
    refetchCart: refetch,
    isFetching: isCartFetching || isProductsFetching,
    isLoading: isCartLoading || isProductsLoading,
    isError: isCartError || isProductsError,
    isEmpty: unifiedCartItems.length === 0,
  };
};