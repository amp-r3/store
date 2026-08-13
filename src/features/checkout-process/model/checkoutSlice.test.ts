import { describe, it, expect } from 'vitest';
import {
  checkoutSlice,
  addToCheckout,
  clearCheckout,
  saveCheckoutDraft,
  clearCheckoutDraft,
  CheckoutState,
} from './checkoutSlice';
import { selectCheckoutItemsArray } from './checkoutSelectors';
import { CartProduct } from '@/entities/cart';

const reducer = checkoutSlice.reducer;

const emptyState: CheckoutState = { items: {}, draft: null };

describe('checkoutSlice', () => {
  describe('addToCheckout', () => {
    it('replaces items wholesale rather than merging — unlike cart.restoreCart', () => {
      const seeded: CheckoutState = {
        items: { 1: { productId: 10, quantity: 1 } },
        draft: null,
      };
      const incoming: CartProduct[] = [{ sizeId: 2, productId: 20, quantity: 3 }];
      const state = reducer(seeded, addToCheckout(incoming));

      expect(state.items).toEqual({ 2: { productId: 20, quantity: 3 } });
    });

    it('keys the resulting map by sizeId', () => {
      const incoming: CartProduct[] = [
        { sizeId: 1, productId: 10, quantity: 2 },
        { sizeId: 2, productId: 10, quantity: 1 },
      ];
      const state = reducer(emptyState, addToCheckout(incoming));

      expect(state.items).toEqual({
        1: { productId: 10, quantity: 2 },
        2: { productId: 10, quantity: 1 },
      });
    });

    it('an empty payload clears items', () => {
      const seeded: CheckoutState = {
        items: { 1: { productId: 10, quantity: 1 } },
        draft: null,
      };
      const state = reducer(seeded, addToCheckout([]));

      expect(state.items).toEqual({});
    });
  });

  describe('clearCheckout', () => {
    it('empties items but leaves draft untouched', () => {
      const seeded: CheckoutState = {
        items: { 1: { productId: 10, quantity: 1 } },
        draft: { firstName: 'Jane' },
      };
      const state = reducer(seeded, clearCheckout());

      expect(state.items).toEqual({});
      expect(state.draft).toEqual({ firstName: 'Jane' });
    });
  });

  describe('saveCheckoutDraft / clearCheckoutDraft', () => {
    it('saveCheckoutDraft stores the given partial form values', () => {
      const state = reducer(emptyState, saveCheckoutDraft({ firstName: 'Jane', lastName: 'Doe' }));
      expect(state.draft).toEqual({ firstName: 'Jane', lastName: 'Doe' });
    });

    it('clearCheckoutDraft clears draft but leaves items untouched', () => {
      const seeded: CheckoutState = {
        items: { 1: { productId: 10, quantity: 1 } },
        draft: { firstName: 'Jane' },
      };
      const state = reducer(seeded, clearCheckoutDraft());

      expect(state.draft).toBeNull();
      expect(state.items).toEqual({ 1: { productId: 10, quantity: 1 } });
    });
  });
});

describe('selectCheckoutItemsArray', () => {
  const stateWith = (items: CheckoutState['items']): { checkout: CheckoutState } => ({
    checkout: { items, draft: null },
  });

  it('maps entries to CartProduct[], coercing the sizeId key with Number', () => {
    const state = stateWith({ 5: { productId: 100, quantity: 2 } });
    expect(selectCheckoutItemsArray(state)).toEqual([{ sizeId: 5, productId: 100, quantity: 2 }]);
  });

  it('memoizes: returns the same reference for the same items reference', () => {
    const state = stateWith({ 5: { productId: 100, quantity: 2 } });
    expect(selectCheckoutItemsArray(state)).toBe(selectCheckoutItemsArray(state));
  });
});
