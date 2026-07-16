import { 
  PaymentOptions, 
  DeliveryOptions, 
  ShippingAddress, 
  DeliveryMethod, 
  PaymentMethod, 
  CheckoutCartItem, 
  CreateOrderPayload 
} from '@/entities/order';

export const STEPS_ORDER = ['contacts', 'delivery', 'payment'] as const;
export type StepType = typeof STEPS_ORDER[number];

export type {
  PaymentOptions,
  DeliveryOptions,
  ShippingAddress,
  DeliveryMethod,
  PaymentMethod,
  CheckoutCartItem,
  CreateOrderPayload
};