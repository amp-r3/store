import { describe, it, expect } from 'vitest';
import { enrichOrderItems } from './enrichOrderItems';
import { makeProduct } from '@test/fixtures';
import { OrderItem } from '../model/types';

const orderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  id: 'item-1',
  orderId: 'order-1',
  productId: 1,
  sizeId: 10,
  quantity: 1,
  priceAtPurchase: 100,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('enrichOrderItems', () => {
  it('returns [] for an empty orderItems or products list', () => {
    expect(enrichOrderItems([], [makeProduct()])).toEqual([]);
    expect(enrichOrderItems([orderItem()], [])).toEqual([]);
    expect(enrichOrderItems([orderItem()], undefined)).toEqual([]);
  });

  it('attaches only the id/title/thumbnail/category slice of the matched product', () => {
    const product = makeProduct({ id: 1, title: 'Boots', category: 'shoes' });
    const [enriched] = enrichOrderItems([orderItem({ productId: 1 })], [product]);

    expect(enriched.product).toEqual({
      id: 1,
      title: 'Boots',
      thumbnail: product.thumbnail,
      category: 'shoes',
    });
    expect(enriched.sizeId).toBe(10);
    expect(enriched.quantity).toBe(1);
  });

  // A deleted/archived product drops its line entirely rather than nulling
  // it (unlike joinCheckoutDetails, which nulls a missing product to keep
  // index alignment) — the order's own stored totals still include that
  // line, so a dropped row here can undercount what was actually charged.
  it('drops a line whose product no longer resolves, rather than nulling it', () => {
    const result = enrichOrderItems(
      [orderItem({ id: 'a', productId: 1 }), orderItem({ id: 'b', productId: 2 })],
      [makeProduct({ id: 1 })],
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('preserves the order of the input order items', () => {
    const p1 = makeProduct({ id: 1 });
    const p2 = makeProduct({ id: 2 });
    const result = enrichOrderItems(
      [orderItem({ id: 'a', productId: 2 }), orderItem({ id: 'b', productId: 1 })],
      [p1, p2],
    );

    expect(result.map((i) => i.id)).toEqual(['a', 'b']);
  });
});
