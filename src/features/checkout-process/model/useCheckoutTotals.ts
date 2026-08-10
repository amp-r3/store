import { useMemo } from 'react';
import { DeliveryMethod, PaymentMethod, isDeliveryFree } from '@/entities/order';
import { calculateOrderTotals } from '@/entities/cart';

interface UseCheckoutTotalsProps {
  cartTotal: number;
  selectedDelivery?: DeliveryMethod | null;
  selectedPayment?: PaymentMethod | null;
}

export const useCheckoutTotals = ({
  cartTotal,
  selectedDelivery,
  selectedPayment,
}: UseCheckoutTotalsProps) => {
  return useMemo(() => {
    const baseDeliveryCost = selectedDelivery?.price || 0;
    const feePercentage = selectedPayment?.feePercentage || 0;
    const feeFixed = selectedPayment?.feeFixed || 0;

    return calculateOrderTotals({
      cartTotal,
      deliveryCost: baseDeliveryCost,
      isDeliveryFree: isDeliveryFree(selectedDelivery, cartTotal),
      paymentFeePercentage: feePercentage,
      paymentFeeFixed: feeFixed,
    });
  }, [cartTotal, selectedDelivery, selectedPayment]);
};
