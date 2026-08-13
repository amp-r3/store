import { describe, it, expect } from 'vitest';
import { getItemsToRender } from './formatters';
import { Product } from '../model/types';
import { ProductsResponse } from '../api/queries';

// Minimal Product stand-ins — getItemsToRender only cares about `id` and
// object identity, so the cast avoids spelling out every unrelated field
// (same pattern cartHelper.test.ts uses for CartItemDetails).
const product = (id: number) => ({ id, title: `Product ${id}` }) as Product;

describe('getItemsToRender', () => {
  it('returns itemsPerPage empty placeholder slots while loading, regardless of response', () => {
    const result = getItemsToRender(undefined, true, 4);
    expect(result).toHaveLength(4);
  });

  it('returns an empty array when the response has no items map', () => {
    const response = { ids: [1, 2], total: 2 } as unknown as ProductsResponse;
    expect(getItemsToRender(response, false, 4)).toEqual([]);
  });

  it('returns an empty array when the response has no ids list', () => {
    const response = { items: { 1: product(1) }, total: 1 } as unknown as ProductsResponse;
    expect(getItemsToRender(response, false, 4)).toEqual([]);
  });

  it('returns an empty array when the response itself is undefined and not loading', () => {
    expect(getItemsToRender(undefined, false, 4)).toEqual([]);
  });

  it('maps items in ids order, not object-key insertion order', () => {
    const response: ProductsResponse = {
      items: { 1: product(1), 2: product(2), 3: product(3) },
      ids: [3, 1, 2],
      total: 3,
    };

    expect(getItemsToRender(response, false, 4).map((item) => item.id)).toEqual([3, 1, 2]);
  });
});
