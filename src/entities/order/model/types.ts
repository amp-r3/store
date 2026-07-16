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
  feeFixed: number;
}

export interface CheckoutCartItem {
  product_id: number;
  size_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  p_shipping_address: ShippingAddress;
  p_payment_method_id: string;
  p_delivery_method_id: string;
  p_items: CheckoutCartItem[];
}
import { Product } from "@/entities/product";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'awaiting_payment' | 'paid' | 'failed' | 'refunded';
export type DeliveryStatus = 'awaiting_dispatch' | 'dispatched' | 'in_transit' | 'delivered' | 'returned' | 'cancelled'
export type OrderItemProduct = Pick<Product, 'id' | 'title' | 'thumbnail' | 'category'>;

export interface EnrichedOrderItem {
  id: string;
  orderId: string;
  sizeId: number;
  quantity: number;
  priceAtPurchase: number;
  createdAt: string;
  product: OrderItemProduct;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: number;
  sizeId: number;
  quantity: number;
  priceAtPurchase: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentOptions;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryMethod_id: string;
  deliveryCost: number;
  paymentFee: number;
  deliveryMethods: DeliveryMethod;
  orderItems: OrderItem[];
}