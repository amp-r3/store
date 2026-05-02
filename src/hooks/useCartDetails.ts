import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItemsArray } from '@/store';
import { CartItem, Product } from '@/types/products'; 
import { useProductsByIds } from './useProductByIds';
import { CartProduct } from '@/store/selectors/cartSelectors';

interface CartDetailsReturn {
  cartDetails: (CartItem | null)[];
  cartItems: CartProduct[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useCartDetails = (isOpen: boolean = true): CartDetailsReturn => {
  const cartItems = useSelector(selectCartItemsArray);
  
  const productIds = useMemo(
    () => cartItems.map(item => item.id), 
    [cartItems]
  );

  const { products, isLoading, isError, isFetching } = useProductsByIds(productIds, isOpen);

  const cartDetails = useMemo(() => {
    const productsMap = products.reduce<Record<number, Product>>((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    return cartItems.map((item) => {
      const serverProduct = productsMap[item.id];

      if (!serverProduct) {
        return null;
      }

      return {
        ...serverProduct,
        quantity: item.quantity,
      };
    });
  }, [products, cartItems]);

  return {
    cartItems,
    cartDetails,  
    isFetching,                
    isLoading, 
    isError,
    isEmpty: cartItems.length === 0,
  };
};