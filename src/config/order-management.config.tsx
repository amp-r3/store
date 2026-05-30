import { ReactNode } from 'react'
import { FaCreditCard, FaPaypal } from 'react-icons/fa'
import { SiKlarna, SiSepa } from 'react-icons/si'
import { LuBanknote, LuHandCoins, LuClipboardCheck, LuCircleAlert, LuShieldCheck, LuClock, LuTruck, LuPlaneTakeoff, LuStore, LuRefreshCw } from 'react-icons/lu'
import { DeliveryStatus, OrderStatus, PaymentStatus } from '@/types/order'

export interface PaymentDetailItem {
  icon: ReactNode
  text: string
}

export interface PaymentBanner {
  icon: ReactNode
  title: string
  description: string
  details: PaymentDetailItem[]
}

export interface PaymentConfig {
  id: string
  label: string
  icon: ReactNode
  banner?: PaymentBanner
}



export const PAYMENT_CONFIG: PaymentConfig[] = [
  {
    id: 'online_card',
    label: 'Online',
    icon: <FaCreditCard />,
    banner: {
      icon: <FaCreditCard />,
      title: 'Pay by card',
      description: 'Secure payment via Visa, Mastercard or other supported cards. Your data is encrypted and never stored.',
      details: [
        { icon: <LuShieldCheck />, text: '3D Secure authentication' },
        { icon: <LuClipboardCheck />, text: 'Instant payment confirmation' },
        { icon: <LuCircleAlert />, text: 'No card details stored on our servers' },
      ],
    },
  },
  {
    id: 'cash_on_delivery',
    label: 'Upon delivery',
    icon: <LuBanknote />,
    banner: {
      icon: <LuBanknote />,
      title: 'Pay upon delivery',
      description: 'Our courier will collect payment when your order arrives. Please have the exact amount ready — change may not always be available.',
      details: [
        { icon: <LuHandCoins />, text: 'Cash or card accepted at the door' },
        { icon: <LuClipboardCheck />, text: "You'll receive an invoice after delivery" },
        { icon: <LuCircleAlert />, text: 'No charges until your order is delivered' },
      ],
    },
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: <FaPaypal />,
    banner: {
      icon: <FaPaypal />,
      title: 'Pay with PayPal',
      description: 'Fast and secure checkout with your PayPal account. No need to enter card details every time.',
      details: [
        { icon: <LuShieldCheck />, text: 'Buyer protection included' },
        { icon: <LuClipboardCheck />, text: 'Instant transfer from your PayPal balance' },
        { icon: <LuClock />, text: 'Refunds processed within 3–5 business days' },
      ],
    },
  },
  {
    id: 'sepa',
    label: 'SEPA',
    icon: <SiSepa />,
    banner: {
      icon: <SiSepa />,
      title: 'SEPA Bank Transfer',
      description: 'Direct bank transfer within the EU. Ideal for larger orders — no card required.',
      details: [
        { icon: <LuClock />, text: 'Processing takes 1–3 business days' },
        { icon: <LuClipboardCheck />, text: 'Order confirmed once payment is received' },
        { icon: <LuShieldCheck />, text: 'Protected under EU payment regulations' },
      ],
    },
  },
  {
    id: 'klarna',
    label: 'Klarna',
    icon: <SiKlarna />,
    banner: {
      icon: <SiKlarna />,
      title: 'Pay with Klarna',
      description: 'Buy now and pay later — split your purchase into instalments or pay in 30 days.',
      details: [
        { icon: <LuClock />, text: 'Pay in 3 interest-free instalments' },
        { icon: <LuShieldCheck />, text: 'No impact on your credit score to apply' },
        { icon: <LuCircleAlert />, text: 'Subject to approval by Klarna' },
      ],
    },
  },
]

export interface DeliveryConfig { id: string; label: string; icon: ReactNode }
export const DELIVERY_CONFIG: DeliveryConfig[] = [
  { id: 'standard', label: 'Standard Delivery', icon: <LuTruck /> },
  { id: 'express', label: 'Express Shipping', icon: <LuPlaneTakeoff /> },
  { id: 'pickup', label: 'In-Store Pickup', icon: <LuStore /> },
]

export interface StatusMeta { label: string; hasIcon?: boolean; icon?: ReactNode }

export const ORDER_STATUS_MAP: Record<OrderStatus | string, StatusMeta> = {
  pending: { label: 'Pending', hasIcon: true, icon: <LuRefreshCw /> },
  processing: { label: 'Processing', hasIcon: true, icon: <LuRefreshCw /> },
  shipped: { label: 'Shipped' },
  completed: { label: 'Completed' },
  cancelled: { label: 'Cancelled' },
}

export const PAYMENT_STATUS_MAP: Record<PaymentStatus | string, StatusMeta> = {
  awaiting_payment: { label: 'Awaiting Payment', hasIcon: true, icon: <LuRefreshCw /> },
  paid: { label: 'Paid Successfully' },
  failed: { label: 'Payment Failed' },
  refunded: { label: 'Refunded' },
}

export const DELIVERY_STATUS_MAP: Record<DeliveryStatus | string, StatusMeta> = {
  awaiting_dispatch: { label: 'Awaiting Dispatch' },
  dispatched: { label: 'Dispatched' },
  in_transit: { label: 'In Transit', hasIcon: true, icon: <LuRefreshCw /> },
  delivered: { label: 'Delivered' },
  returned: { label: 'Returned' },
  cancelled: { label: 'Cancelled' },
}