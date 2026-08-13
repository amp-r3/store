import { describe, it, expect } from 'vitest';
import { joinCheckoutDetails } from './joinCheckoutDetails';
import { makeProduct } from '@test/fixtures';
import { CartProduct } from '@/entities/cart';

describe('joinCheckoutDetails', () => {
  it('attaches the matched product plus sizeId/quantity for each item', () => {
    const product = makeProduct({ id: 1, price: 50 });
    const items: CartProduct[] = [{ productId: 1, sizeId: 10, quantity: 2 }];

    const [detail] = joinCheckoutDetails(items, [product]);

    expect(detail).toMatchObject({ ...product, sizeId: 10, quantity: 2 });
  });

  // Index-aligned with checkoutItems — SummaryItems reads
  // checkoutDetails[index] against checkoutItems[index], so a missing
  // product must produce a positional `null`, not be filtered out, or the
  // two arrays desync.
  it('nulls (not drops) a line whose product does not resolve, preserving index alignment', () => {
    const items: CartProduct[] = [
      { productId: 1, sizeId: 10, quantity: 1 },
      { productId: 2, sizeId: 20, quantity: 1 },
      { productId: 3, sizeId: 30, quantity: 1 },
    ];
    const products = [makeProduct({ id: 1 }), makeProduct({ id: 3 })];

    const result = joinCheckoutDetails(items, products);

    expect(result).toHaveLength(3);
    expect(result[0]).not.toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).not.toBeNull();
  });

  it('returns an empty array for an empty checkout', () => {
    expect(joinCheckoutDetails([], [makeProduct()])).toEqual([]);
  });
});
