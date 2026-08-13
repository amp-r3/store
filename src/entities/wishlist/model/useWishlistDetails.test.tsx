import { describe, it, expect } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedProductArray, seedWishlist } from '@test/seedApi';
import { makeProduct } from '@test/fixtures';
import { toogleFavorite } from '@/entities/wishlist';
import { setSession } from '@/entities/session';
import { useWishlistDetails } from './useWishlistDetails';

const AUTH_USER = {
  id: 'test-user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'test@example.com',
  role: 'user' as const,
  accessToken: 'test-token',
};

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

describe('useWishlistDetails — guest (Redux) path', () => {
  it('is empty for an empty wishlist', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useWishlistDetails(), { wrapper: wrapperFor(store) });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalQuantity).toBe(0);
    expect(result.current.wishlistDetails).toEqual([]);
  });

  it('joins locally-favorited ids with fetched product data', async () => {
    const store = createTestStore();
    store.dispatch(toogleFavorite(10));
    const product = makeProduct({ id: 10 });
    await seedProductArray(store, [10], [product]);

    const { result } = renderHook(() => useWishlistDetails(), { wrapper: wrapperFor(store) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.wishlistItems).toEqual([{ id: 10 }]);
    expect(result.current.wishlistDetails).toEqual([product]);
    expect(result.current.totalQuantity).toBe(1);
  });
});

describe('useWishlistDetails — authenticated (server) path', () => {
  it('sources favorites from the server wishlist, not the local Redux slice', async () => {
    const store = createTestStore();
    store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
    await seedWishlist(store, { 20: true });
    const product = makeProduct({ id: 20 });
    await seedProductArray(store, [20], [product]);

    const { result } = renderHook(() => useWishlistDetails(), { wrapper: wrapperFor(store) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.wishlistItems).toEqual([{ id: 20 }]);
    expect(result.current.wishlistDetails).toEqual([product]);
  });

  it('falls back to the local wishlist while the server query is still loading', () => {
    const store = createTestStore();
    store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
    store.dispatch(toogleFavorite(30));
    // No seedWishlist here — getWishlist stays unresolved (skip: false, but
    // no cached data yet), so unifyWishlist must fall back to local items.

    const { result } = renderHook(() => useWishlistDetails(), { wrapper: wrapperFor(store) });

    expect(result.current.wishlistItems).toEqual([{ id: 30 }]);
  });
});
