import { DeliveryMethod, PaymentOptions, ShippingAddress } from "./checkout";
import { Product } from "./products";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'awaiting_payment' | 'paid' | 'failed' | 'refunded';
export type DeliveryStatus = 'awaiting_dispatch' | 'dispatched' | 'in_transit' | 'delivered' | 'returned' | 'cancelled'
export type OrderItemProduct = Pick<Product, 'id' | 'title' | 'thumbnail' | 'category'>;

export interface EnrichedOrderItem {
  id: string;
  orderId: string;
  quantity: number;
  priceAtPurchase: number;
  createdAt: string;
  product: OrderItemProduct;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: number;
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