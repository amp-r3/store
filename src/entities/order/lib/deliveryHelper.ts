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

// The first method in the list that carries any free-shipping threshold —
// NOT the currently-selected delivery method. Used to render progress
// toward free shipping (e.g. "$12 away from free shipping") before the user
// has picked a method; once a method IS selected, isDeliveryFree/
// remainingForFreeDelivery above are the ones that must be evaluated
// against that selection, not this global "first found" threshold — mixing
// the two produces a progress bar and a checkout total that disagree.
export const pickFreeShippingThreshold = (
  methods: DeliveryMethod[] | null | undefined,
): number | null =>
  methods?.find((method) => method.freeFromPrice !== null && method.freeFromPrice > 0)
    ?.freeFromPrice ?? null;
