import { describe, it, expect } from 'vitest';
import {
  cartSlice,
  changeQuantity,
  removeFromCart,
  restoreCart,
  restoreCartItem,
  clearCart,
  openCart,
  closeCart,
  CartState,
} from './cartSlice';

// Testing the raw (unpersisted) reducer directly — cartReducer wraps it in
// redux-persist, which is orthogonal to the reducer logic under test.
const reducer = cartSlice.reducer;

const emptyState: CartState = { items: {}, isOpen: false };

describe('cartSlice', () => {
  describe('changeQuantity', () => {
    it('inc on a missing sizeId creates a new entry at quantity 1', () => {
      const state = reducer(emptyState, changeQuantity({ sizeId: 1, productId: 10, type: 'inc' }));
      expect(state.items[1]).toEqual({ productId: 10, quantity: 1 });
    });

    it('dec on a missing sizeId is a no-op', () => {
      const state = reducer(emptyState, changeQuantity({ sizeId: 1, productId: 10, type: 'dec' }));
      expect(state.items).toEqual({});
    });

    it('inc increments an existing entry with no stock cap in the reducer', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 5 } }, isOpen: false };
      const state = reducer(seeded, changeQuantity({ sizeId: 1, productId: 10, type: 'inc' }));
      expect(state.items[1].quantity).toBe(6);
    });

    it('dec above quantity 1 decrements', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 2 } }, isOpen: false };
      const state = reducer(seeded, changeQuantity({ sizeId: 1, productId: 10, type: 'dec' }));
      expect(state.items[1].quantity).toBe(1);
    });

    it('dec at quantity 1 deletes the entry rather than going to 0', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 1 } }, isOpen: false };
      const state = reducer(seeded, changeQuantity({ sizeId: 1, productId: 10, type: 'dec' }));
      expect(state.items[1]).toBeUndefined();
    });

    it('keys by sizeId — two sizes of the same product are independent entries', () => {
      let state = reducer(emptyState, changeQuantity({ sizeId: 1, productId: 10, type: 'inc' }));
      state = reducer(state, changeQuantity({ sizeId: 2, productId: 10, type: 'inc' }));
      state = reducer(state, changeQuantity({ sizeId: 1, productId: 10, type: 'inc' }));

      expect(state.items[1].quantity).toBe(2);
      expect(state.items[2].quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('deletes the item at the given sizeId', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 3 } }, isOpen: false };
      const state = reducer(seeded, removeFromCart(1));
      expect(state.items[1]).toBeUndefined();
    });
  });

  describe('restoreCartItem', () => {
    it('unconditionally overwrites the entry at sizeId', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 3 } }, isOpen: false };
      const state = reducer(seeded, restoreCartItem({ sizeId: 1, productId: 99, quantity: 7 }));
      expect(state.items[1]).toEqual({ productId: 99, quantity: 7 });
    });
  });

  describe('restoreCart', () => {
    it('merges into existing items rather than replacing them', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 3 } }, isOpen: false };
      const state = reducer(seeded, restoreCart({ 2: { productId: 20, quantity: 1 } }));
      expect(state.items[1]).toEqual({ productId: 10, quantity: 3 });
      expect(state.items[2]).toEqual({ productId: 20, quantity: 1 });
    });
  });

  describe('clearCart', () => {
    it('empties items but leaves isOpen untouched', () => {
      const seeded: CartState = { items: { 1: { productId: 10, quantity: 3 } }, isOpen: true };
      const state = reducer(seeded, clearCart());
      expect(state.items).toEqual({});
      expect(state.isOpen).toBe(true);
    });
  });

  describe('openCart / closeCart', () => {
    it('toggle isOpen without touching items', () => {
      const opened = reducer(emptyState, openCart());
      expect(opened.isOpen).toBe(true);

      const closed = reducer(opened, closeCart());
      expect(closed.isOpen).toBe(false);
    });
  });
});
