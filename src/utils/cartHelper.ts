import { CartItem } from '@/types/products';

const roundPrice = (num: number) => Number(Math.round(Number(num + 'e2')) + 'e-2');

export const calculateCartTotals = (items: CartItem[], freeShippingThreshold: number | null) => {
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