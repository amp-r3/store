// Mirrors products.price's generated-column expression exactly:
// round(base_price * (1 - coalesce(discount_percentage, 0) / 100), 2)
export const calculatePrice = (basePrice: number, discountPercentage: number): number =>
  Math.round(basePrice * (1 - (discountPercentage || 0) / 100) * 100) / 100;
