import { Product } from '@/entities/product';
import { CartItemDetails, CartProduct } from '@/entities/cart';

// Index-aligned with `checkoutItems` — SummaryItems reads
// `checkoutDetails[index]` against `checkoutItems[index]`, so a null here
// (product missing/deleted) must stay a positional placeholder, never be
// filtered out, or the two arrays desync. A missing product also silently
// drops that line from `totals` (calculateCartTotals only sees the
// non-null items) — the rendered summary can undercount what the server
// will actually charge.
export const joinCheckoutDetails = (
  checkoutItems: CartProduct[],
  products: Product[],
): (CartItemDetails | null)[] => {
  const productsMap = products.reduce<Record<number, Product>>((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {});

  return checkoutItems.map((item) => {
    const serverProduct = productsMap[item.productId];
    if (!serverProduct) return null;

    return {
      ...serverProduct,
      sizeId: item.sizeId,
      quantity: item.quantity,
    };
  });
};
