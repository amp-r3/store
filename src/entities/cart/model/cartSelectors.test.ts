import { describe, it, expect } from 'vitest';
import {
  selectCartItemsArray,
  selectCartTotalQuantity,
  selectQuantityById,
  selectIsMaxReached,
} from './cartSelectors';
import { CartState } from './cartSlice';

const stateWith = (items: CartState['items']): { cart: CartState } => ({
  cart: { items, isOpen: false },
});

describe('selectCartItemsArray', () => {
  it('maps entries to CartProduct[], coercing the sizeId key with Number', () => {
    const state = stateWith({ 5: { productId: 100, quantity: 2 } });
    expect(selectCartItemsArray(state)).toEqual([{ sizeId: 5, productId: 100, quantity: 2 }]);
  });

  it('memoizes: returns the same reference for the same items reference', () => {
    const state = stateWith({ 5: { productId: 100, quantity: 2 } });
    expect(selectCartItemsArray(state)).toBe(selectCartItemsArray(state));
  });
});

describe('selectCartTotalQuantity', () => {
  it('sums quantity across all items (the badge count)', () => {
    const state = stateWith({
      1: { productId: 10, quantity: 2 },
      2: { productId: 20, quantity: 3 },
    });
    expect(selectCartTotalQuantity(state)).toBe(5);
  });

  it('memoizes: returns the same reference for the same items reference', () => {
    const state = stateWith({ 1: { productId: 10, quantity: 2 } });
    expect(selectCartTotalQuantity(state)).toBe(selectCartTotalQuantity(state));
  });
});

describe('selectQuantityById', () => {
  it('resolves through productId even when sizeId differs from it', () => {
    // sizeId 1 maps to productId 10 — a direct items[10] lookup would miss this
    const state = stateWith({ 1: { productId: 10, quantity: 4 } });
    expect(selectQuantityById(state, 10)).toBe(4);
  });

  it('sums quantity across every sizeId entry that belongs to the productId', () => {
    const state = stateWith({
      1: { productId: 10, quantity: 2 }, // size S
      2: { productId: 10, quantity: 3 }, // size M
      3: { productId: 20, quantity: 5 }, // a different product
    });
    expect(selectQuantityById(state, 10)).toBe(5);
  });

  it('returns 0 when no entry exists for that productId', () => {
    const state = stateWith({ 1: { productId: 10, quantity: 4 } });
    expect(selectQuantityById(state, 999)).toBe(0);
  });

  it('returns 0 for an empty cart', () => {
    expect(selectQuantityById(stateWith({}), 10)).toBe(0);
  });
});

describe('selectIsMaxReached', () => {
  it('is true once quantity meets or exceeds stock', () => {
    expect(selectIsMaxReached(5, 5)).toBe(true);
    expect(selectIsMaxReached(6, 5)).toBe(true);
  });

  it('is false while quantity is below stock', () => {
    expect(selectIsMaxReached(4, 5)).toBe(false);
  });
});
