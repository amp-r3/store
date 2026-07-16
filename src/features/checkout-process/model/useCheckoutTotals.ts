import { useMemo } from 'react';
import { DeliveryMethod, PaymentMethod } from '@/entities/order';
import { calculateOrderTotals } from '@/entities/cart';

interface UseCheckoutTotalsProps {
    cartTotal: number;
    freeShippingThreshold: number | null;
    selectedDelivery?: DeliveryMethod | null;
    selectedPayment?: PaymentMethod | null;
}

export const useCheckoutTotals = ({
    cartTotal,
    freeShippingThreshold,
    selectedDelivery,
    selectedPayment,
}: UseCheckoutTotalsProps) => {
    return useMemo(() => {
        const baseDeliveryCost = selectedDelivery?.price || 0;
        const feePercentage = selectedPayment?.feePercentage || 0;
        const feeFixed = selectedPayment?.feeFixed || 0;

        const isStandardDelivery = selectedDelivery?.code === 'standard';
        const isAboveThreshold = freeShippingThreshold !== null && cartTotal >= freeShippingThreshold;
        const isDeliveryFree = isStandardDelivery && isAboveThreshold;

        return calculateOrderTotals({
            cartTotal,
            deliveryCost: baseDeliveryCost,
            isDeliveryFree,
            paymentFeePercentage: feePercentage,
            paymentFeeFixed: feeFixed,
        });
    }, [cartTotal, freeShippingThreshold, selectedDelivery, selectedPayment]);
};