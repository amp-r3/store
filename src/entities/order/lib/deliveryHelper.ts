import { DeliveryMethod } from '@/entities/order/model/types';

export const isDeliveryFree = (
  method: DeliveryMethod | null | undefined,
  cartTotal: number,
): boolean =>
  !!method &&
  method.freeFromPrice !== null &&
  method.freeFromPrice > 0 &&
  cartTotal >= method.freeFromPrice;

export const remainingForFreeDelivery = (
  method: DeliveryMethod | null | undefined,
  cartTotal: number,
): number => {
  if (!method || method.freeFromPrice === null || method.freeFromPrice <= 0) return 0;
  return Math.max(0, method.freeFromPrice - cartTotal);
};
