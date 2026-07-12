import { useMemo } from "react";
import { EnrichedOrderItem, OrderItem } from "@/entities/order/model/types";
import { useProductsByIds } from "@/entities/product";

interface UseEnrichedOrderItemsReturn {
  items: EnrichedOrderItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const useEnrichedOrderItems = (
  orderItems: OrderItem[],
): UseEnrichedOrderItemsReturn => {

  const ids = useMemo(() => {
    return orderItems.map(item => item.productId);
  }, [orderItems]);

  const { products, isLoading, isFetching, isError } = useProductsByIds(ids);

  const items = useMemo(() => {
    if (!products?.length || !orderItems?.length) return [];

    const productsMap = new Map(products.map((p: any) => [p.id, p]));

    return orderItems.reduce<EnrichedOrderItem[]>((acc, orderItem) => {
      const product: any = productsMap.get(orderItem.productId);

      if (product) {
        const { id, title, thumbnail, category } = product;
        acc.push({
          ...orderItem,
          product: { id, title, thumbnail, category }
        });
      }

      return acc;
    }, []);
  }, [orderItems, products]);

  return { items, isLoading, isFetching, isError };
};