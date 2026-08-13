import { describe, it, expect } from 'vitest';
import { unifyWishlist } from './unifyWishlist';

describe('unifyWishlist', () => {
  it('uses the server wishlist when authenticated and the server data is present', () => {
    const result = unifyWishlist(true, { 1: true, 2: true }, [{ id: 99 }]);

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('falls back to the local list while authenticated but the server data has not loaded yet', () => {
    const result = unifyWishlist(true, undefined, [{ id: 5 }]);

    expect(result).toEqual([{ id: 5 }]);
  });

  it('uses the local list for a guest', () => {
    const result = unifyWishlist(false, { 1: true }, [{ id: 5 }]);

    expect(result).toEqual([{ id: 5 }]);
  });

  // wishlistApi's optimistic update deletes a key on removal rather than
  // setting it false — this keeps every key regardless of its boolean
  // value, which only stays correct as long as that invariant holds; a
  // future write path that sets `false` instead of deleting would
  // resurrect a removed favorite here.
  it('keeps a server key even if its boolean value is false', () => {
    const result = unifyWishlist(true, { 1: false }, []);

    expect(result).toEqual([{ id: 1 }]);
  });

  it('returns an empty array for an empty server wishlist', () => {
    const result = unifyWishlist(true, {}, [{ id: 5 }]);

    expect(result).toEqual([]);
  });
});
