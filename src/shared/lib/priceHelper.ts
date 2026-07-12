
export const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
};

export const roundPrice = (num: number) => Number(Math.round(Number(num + 'e2')) + 'e-2');

interface PriceableItem {
    basePrice: number;
    price: number;
    quantity: number;
}

export const calculateCartTotals = (items: PriceableItem[], freeShippingThreshold: number | null) => {
    const { subtotal, total } = items.reduce(
        (acc, item) => {
            const lineOriginalTotal = item.basePrice * item.quantity;
            const lineDiscountedTotal = item.price * item.quantity;

            return {
                subtotal: acc.subtotal + lineOriginalTotal,
                total: acc.total + lineDiscountedTotal,
            };
        },
        { subtotal: 0, total: 0 }
    );

    const safeSubtotal = roundPrice(subtotal);
    const safeTotal = roundPrice(total);

    const discountAmount = roundPrice(safeSubtotal - safeTotal);
    const discountPercent = safeSubtotal > 0
        ? Math.round((discountAmount / safeSubtotal) * 100)
        : 0;

    let shippingProgress = 0;
    let remainingForFreeShipping = 0;

    if (freeShippingThreshold !== null && freeShippingThreshold > 0) {
        shippingProgress = Math.min((safeTotal / freeShippingThreshold) * 100, 100);
        remainingForFreeShipping = Math.max(0, freeShippingThreshold - safeTotal);
    } else if (freeShippingThreshold === 0) {
        shippingProgress = 100;
        remainingForFreeShipping = 0;
    }

    return {
        subtotal: safeSubtotal,
        total: safeTotal,
        discountAmount,
        discountPercent,
        shippingProgress,
        remainingForFreeShipping,
    };
};

export interface OrderTotalsParams {
    cartTotal: number;
    deliveryCost: number;
    isDeliveryFree: boolean;
    paymentFeePercentage: number;
    paymentFeeFixed: number;
}

export const calculateOrderTotals = ({
    cartTotal,
    deliveryCost = 0,
    isDeliveryFree = false,
    paymentFeePercentage = 0,
    paymentFeeFixed = 0,
}: OrderTotalsParams) => {
    const finalDeliveryCost = isDeliveryFree ? 0 : deliveryCost;

    const feePercentageAmount = roundPrice(cartTotal * (paymentFeePercentage / 100));
    const totalPaymentFee = roundPrice(feePercentageAmount + paymentFeeFixed);

    const finalTotalPrice = roundPrice(cartTotal + finalDeliveryCost + totalPaymentFee);

    return {
        deliveryCost: finalDeliveryCost,
        feePercentage: paymentFeePercentage,
        feeFixed: paymentFeeFixed,
        feePercentageAmount,
        totalPaymentFee,
        finalTotalPrice,
    };
};