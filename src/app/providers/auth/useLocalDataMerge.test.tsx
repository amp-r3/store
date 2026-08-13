import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedCart } from '@test/seedApi';
import { supabase } from '@/shared/api/supabase/client';
import { restoreCart, cartApi } from '@/entities/cart';
import { toogleFavorite } from '@/entities/wishlist';
import { setSession } from '@/entities/session';
import { useLocalDataMerge } from './useLocalDataMerge';

// A .tsx file (jsdom/component project) — createTestStore pulls in
// @/app/store, whose side-effect imports need vitest.setup.ts's
// @/shared/api/revalidate mock (component-project-only, see AGENTS.md).

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const AUTH_SESSION = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  access_token: 'test-token',
};

const AUTH_USER = {
  id: 'test-user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'test@example.com',
  role: 'user' as const,
  accessToken: 'test-token',
};

beforeEach(() => {
  supabaseStub.__reset();
});

describe('useLocalDataMerge — SIGNED_IN cart sync', () => {
  it('syncs every local cart line to the server and then clears local state', async () => {
    const store = createTestStore();
    store.dispatch(restoreCart({ 1: { productId: 10, quantity: 2 } }));
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', AUTH_SESSION);

    await waitFor(() => {
      expect(store.getState().cart.items).toEqual({});
    });
    const upsertCall = supabaseStub
      .__getCalls('cart_items')
      .find((call) => call.method === 'upsert');
    expect(upsertCall?.args[0]).toEqual([{ user_id: 'test-user-id', size_id: 1, quantity: 2 }]);
  });

  it('leaves the local cart intact when the sync fails, so nothing is silently lost', async () => {
    const store = createTestStore();
    store.dispatch(restoreCart({ 1: { productId: 10, quantity: 2 } }));
    supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', AUTH_SESSION);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    expect(store.getState().cart.items).toEqual({ 1: { productId: 10, quantity: 2 } });
    consoleError.mockRestore();
  });

  it('attempts no write for an empty local cart', async () => {
    const store = createTestStore();
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', AUTH_SESSION);
    // The empty-cart branch takes no `await`, so the listener runs to
    // completion synchronously — still yield a real tick before asserting
    // the negative, rather than relying on that implementation detail.
    await Promise.resolve();

    expect(
      supabaseStub.__getCalls('cart_items').filter((call) => call.method === 'upsert'),
    ).toHaveLength(0);
  });
});

describe('useLocalDataMerge — SIGNED_IN wishlist sync', () => {
  it('syncs every local favorite to the server and then clears local state', async () => {
    const store = createTestStore();
    store.dispatch(toogleFavorite(42));
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', AUTH_SESSION);

    await waitFor(() => {
      expect(store.getState().wishlist.favoriteItems).toEqual({});
    });
    const upsertCall = supabaseStub
      .__getCalls('wishlist_items')
      .find((call) => call.method === 'upsert');
    expect(upsertCall?.args[0]).toEqual([{ user_id: 'test-user-id', product_id: 42 }]);
  });

  it('leaves the local wishlist intact when the sync fails', async () => {
    const store = createTestStore();
    store.dispatch(toogleFavorite(42));
    supabaseStub.__setTable('wishlist_items', { error: { code: 'PGRST000', message: 'boom' } });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', AUTH_SESSION);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    expect(store.getState().wishlist.favoriteItems).toEqual({ 42: true });
    consoleError.mockRestore();
  });

  it('attempts no write for an empty local wishlist', async () => {
    const store = createTestStore();
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', AUTH_SESSION);
    await Promise.resolve();

    expect(
      supabaseStub.__getCalls('wishlist_items').filter((call) => call.method === 'upsert'),
    ).toHaveLength(0);
  });
});

describe('useLocalDataMerge — SIGNED_OUT', () => {
  it('resets cart, wishlist, auth state, and the RTK Query cache', async () => {
    const store = createTestStore();
    store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
    store.dispatch(restoreCart({ 1: { productId: 10, quantity: 2 } }));
    store.dispatch(toogleFavorite(42));
    await seedCart(store, { 1: { productId: 10, quantity: 2 } });
    renderHook(() => useLocalDataMerge(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_OUT', null);

    await waitFor(() => {
      expect(store.getState().auth.user).toBeNull();
    });
    expect(store.getState().cart.items).toEqual({});
    expect(store.getState().wishlist.favoriteItems).toEqual({});
    expect(cartApi.endpoints.getCart.select()(store.getState()).data).toBeUndefined();
  });
});
