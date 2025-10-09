export const applyDiscount = (discountPercentage, price) => {
    if (discountPercentage) {
        const discountedPrice = Math.round(price - (price * discountPercentage) / 100);
        if (discountedPrice < 100) {
            return discountedPrice + ',00'
        } else {
            return discountedPrice
        }
    }
}