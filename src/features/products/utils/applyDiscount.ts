export const applyDiscount = (discountPercentage: number, price: number): number => {
    if (discountPercentage > 0) {
        return Math.round(price - (price * discountPercentage) / 100);
    }
    return price;
}