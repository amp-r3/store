interface DiscountParams {
    price: number;
    discount: number;
}

export const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
};

export const applyDiscount = ({ price, discount }: DiscountParams): number => {
    if (discount <= 0) return price;
    const finalDiscount = Math.min(discount, 100);
    const result = price - (price * finalDiscount) / 100;

    return Number(result.toFixed(2));
}