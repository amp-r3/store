import { describe, it, expect } from 'vitest';
import {
  wishlistSlice,
  toogleFavorite,
  clearFavorite,
  addFavorite,
  WishlistState,
} from './wishlistSlice';

// Testing the raw (unpersisted) reducer directly — wishlistReducer wraps it
// in redux-persist, which is orthogonal to the reducer logic under test.
const reducer = wishlistSlice.reducer;

const emptyState: WishlistState = { favoriteItems: {} };

describe('wishlistSlice', () => {
  describe('toogleFavorite', () => {
    it('adds a product id that is not yet favorited', () => {
      const state = reducer(emptyState, toogleFavorite(5));
      expect(state.favoriteItems[5]).toBe(true);
    });

    it('removes a product id that is already favorited', () => {
      const seeded: WishlistState = { favoriteItems: { 5: true } };
      const state = reducer(seeded, toogleFavorite(5));
      expect(state.favoriteItems[5]).toBeUndefined();
    });

    it('does not disturb other favorited ids', () => {
      const seeded: WishlistState = { favoriteItems: { 5: true, 6: true } };
      const state = reducer(seeded, toogleFavorite(5));
      expect(state.favoriteItems).toEqual({ 6: true });
    });
  });

  describe('addFavorite', () => {
    it('unconditionally adds, even if already favorited', () => {
      const seeded: WishlistState = { favoriteItems: { 5: true } };
      const state = reducer(seeded, addFavorite(5));
      expect(state.favoriteItems[5]).toBe(true);
    });

    it('adds an id that was not previously favorited', () => {
      const state = reducer(emptyState, addFavorite(7));
      expect(state.favoriteItems[7]).toBe(true);
    });
  });

  describe('clearFavorite', () => {
    it('empties every favorited id', () => {
      const seeded: WishlistState = { favoriteItems: { 5: true, 6: true } };
      const state = reducer(seeded, clearFavorite());
      expect(state.favoriteItems).toEqual({});
    });
  });
});
