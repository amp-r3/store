import { useMemo } from 'react';
import { EnrichedOrderItem, OrderItem } from '@/entities/order/model/types';
import { useProductsByIds } from '@/entities/product';
import { enrichOrderItems } from '../lib/enrichOrderItems';

interface UseEnrichedOrderItemsReturn {
  items: EnrichedOrderItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const useEnrichedOrderItems = (orderItems: OrderItem[]): UseEnrichedOrderItemsReturn => {
  const ids = useMemo(() => {
    return orderItems.map((item) => item.productId);
  }, [orderItems]);

  const { products, isLoading, isFetching, isError } = useProductsByIds(ids);

  const items = useMemo(() => enrichOrderItems(orderItems, products), [orderItems, products]);

  return { items, isLoading, isFetching, isError };
};
