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
    
    const details = products.map((product) => {
      const localItem = cartItems.find((item) => item.id === Number(product.id));
      const quantity = localItem ? localItem.quantity : 0;
      

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