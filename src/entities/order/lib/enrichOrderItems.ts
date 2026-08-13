import { Product } from '@/entities/product';
import { EnrichedOrderItem, OrderItem } from '../model/types';

// A product that no longer resolves (deleted/archived) drops its line from
// the result entirely, rather than nulling it — unlike
// useCheckoutDetails/joinCheckoutDetails, which nulls a missing product so
// the row still renders as a placeholder. The order's own stored totals
// still include the missing line, so a dropped row here means the rendered
// items can undercount what was actually charged.
export const enrichOrderItems = (
  orderItems: OrderItem[],
  products: Product[] | undefined,
): EnrichedOrderItem[] => {
  if (!products?.length || !orderItems?.length) return [];

  const productsMap = new Map(products.map((p) => [p.id, p]));

  return orderItems.reduce<EnrichedOrderItem[]>((acc, orderItem) => {
    const product = productsMap.get(orderItem.productId);

    if (product) {
      const { id, title, thumbnail, category } = product;
      acc.push({
        ...orderItem,
        product: { id, title, thumbnail, category },
      });
    }

    return acc;
  }, []);
};
