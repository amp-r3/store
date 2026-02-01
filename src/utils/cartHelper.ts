import { CartItem } from '@/types/products';
import { applyDiscount } from './priceHelper';

export const calculateCartTotals = (items: CartItem[]) => {
    const FREE_SHIPPING_THRESHOLD = 200;

    const { subtotal, total } = items.reduce(
        (acc, item) => {
            const priceOriginal = item.price;

            const priceDiscounted = applyDiscount({ price: item.price, discount:item.discountPercentage});

            const lineOriginalTotal = priceOriginal * item.quantity;
            const lineDiscountedTotal = priceDiscounted * item.quantity;

            return {
                subtotal: acc.subtotal + lineOriginalTotal,
                total: acc.total + lineDiscountedTotal,
            };
        },
        { subtotal: 0, total: 0 }
    );

    const discountAmount = subtotal - total;

    const discountPercent = subtotal > 0
        ? Math.round((discountAmount / subtotal) * 100)
        : 0;

    const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - total;

    return {
        subtotal,
        total,
        discountAmount,
        discountPercent,
        shippingProgress,
        remainingForFreeShipping,
    };
};