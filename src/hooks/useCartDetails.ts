import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItemsArray } from '@/store';
import { CartItem } from '@/types/products';
import { useProductsByIds } from './useProductByIds';

interface CartDetailsReturn {
  cartDetails: CartItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
}

export const useCartDetails = (isOpen: boolean = true): CartDetailsReturn => {
  const cartItems = useSelector(selectCartItemsArray);
  
  const productIds = useMemo(
    () => cartItems.map(item => String(item.id)), 
    [cartItems]
  );

  const { products, isLoading, isError, isFetching } = useProductsByIds(productIds, isOpen);

  const { cartDetails } = useMemo(() => {
    const quantityMap = cartItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = item.quantity;
      return acc;
    }, {});

    const details = products.map((product) => {
      const quantity = quantityMap[product.id] || 0; 

      return {
        ...product,
        quantity,
      };
    });

    return { 
        cartDetails: details, 
    };
  }, [products, cartItems]);

  return {
    cartDetails,  
    isFetching,                
    isLoading, 
    isError,
    isEmpty: cartItems.length === 0,
  };
};