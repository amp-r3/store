export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'awaiting_payment' | 'paid' | 'failed' | 'refunded';
export type PaymentOptions = 'cash_on_delivery' | 'online_card' | 'paypal' | 'sepa' | 'klarna';
export type DeliveryOptions = 'standard' | 'express' | 'pickup';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
}

export interface DeliveryMethod {
  id: string;
  code: DeliveryOptions;
  label: string;
  price: number;
  duration: string;
  isActive: boolean;
  freeFromPrice: number | null;
}

export interface PaymentMethod {
  id: string;
  code: PaymentOptions;
  feePercentage: number;
  feeFixed: number
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentOptions;
  paymentStatus: PaymentStatus;
  deliveryMethod_id: string | null;
  deliveryCost: number;
  paymentFee: number;
  deliveryMethods: DeliveryMethod;
}

export interface CheckoutCartItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  p_shipping_address: ShippingAddress;
  p_payment_method_id: string;
  p_delivery_method_id: string;
  p_items: CheckoutCartItem[];
}