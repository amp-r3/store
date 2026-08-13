import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore } from '@test/renderWithProviders';
import { seedCart } from '@test/seedApi';
import { supabase } from '@/shared/api/supabase/client';
import { cartApi, CartData } from '@/entities/cart';

// A .tsx file (not .ts) so this routes to Vitest's jsdom `component` project —
// cartApi.ts is reachable from @/app/store.ts, whose side-effect imports pull
// in @/entities/order/review, which import @/shared/api/revalidate — a
// 'use server' module vitest.setup.ts mocks, but only for the component
// project (see AGENTS.md's Unit & Component Tests section).

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const getCartCache = (store: ReturnType<typeof createTestStore>) =>
  cartApi.endpoints.getCart.select()(store.getState()).data;

// The stub instance is shared across every test in this file (vi.mock's
// factory runs once per file) — without a reset, an earlier test's
// __setTable('cart_items', { error }) or recorded calls would leak forward.
beforeEach(() => {
  supabaseStub.__reset();
});

describe('cartApi', () => {
  describe('upsertCartItem — optimistic patch', () => {
    it('inc patches quantity +1', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });

      await store.dispatch(
        cartApi.endpoints.upsertCartItem.initiate({ sizeId: 1, productId: 10, action: 'inc' }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 3 });
    });

    it('dec above quantity 1 patches -1', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });

      await store.dispatch(
        cartApi.endpoints.upsertCartItem.initiate({ sizeId: 1, productId: 10, action: 'dec' }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 1 });
    });

    it('dec at quantity 1 deletes the entry rather than patching to 0', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 1 } });

      await store.dispatch(
        cartApi.endpoints.upsertCartItem.initiate({ sizeId: 1, productId: 10, action: 'dec' }),
      );

      expect(getCartCache(store)?.[1]).toBeUndefined();
    });

    it('inc on a missing entry patches to quantity 1', async () => {
      const store = createTestStore();
      await seedCart(store, {});

      await store.dispatch(
        cartApi.endpoints.upsertCartItem.initiate({ sizeId: 1, productId: 10, action: 'inc' }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 1 });
    });
  });

  describe('rollback on failure', () => {
    it('upsertCartItem inc reverts the cache to its pre-mutation value', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });
      supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(
        cartApi.endpoints.upsertCartItem.initiate({ sizeId: 1, productId: 10, action: 'inc' }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 2 });
    });

    it('upsertCartItem dec-at-1 restores the deleted entry — a separate onQueryStarted branch from inc/dec-above-1', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 1 } });
      supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(
        cartApi.endpoints.upsertCartItem.initiate({ sizeId: 1, productId: 10, action: 'dec' }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 1 });
    });

    it('deleteCartItem restores the deleted entry', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });
      supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(cartApi.endpoints.deleteCartItem.initiate(1));

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 2 });
    });

    it('restoreCartItem reverts to the entry it was about to overwrite', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });
      supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(
        cartApi.endpoints.restoreCartItem.initiate({ sizeId: 1, productId: 10, quantity: 9 }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 2 });
    });

    it('restoreCart reverts a bulk snapshot merge', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });
      supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(
        cartApi.endpoints.restoreCart.initiate({ 2: { productId: 20, quantity: 5 } }),
      );

      expect(getCartCache(store)).toEqual({ 1: { productId: 10, quantity: 2 } });
    });

    it('clearCart restores every entry that was optimistically wiped', async () => {
      const store = createTestStore();
      const seeded: Record<number, CartData> = {
        1: { productId: 10, quantity: 2 },
        2: { productId: 20, quantity: 1 },
      };
      await seedCart(store, seeded);
      supabaseStub.__setTable('cart_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(cartApi.endpoints.clearCart.initiate());

      expect(getCartCache(store)).toEqual(seeded);
    });
  });

  describe('success paths', () => {
    it('restoreCartItem sets an exact quantity, not a relative step', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });

      await store.dispatch(
        cartApi.endpoints.restoreCartItem.initiate({ sizeId: 1, productId: 10, quantity: 9 }),
      );

      expect(getCartCache(store)?.[1]).toEqual({ productId: 10, quantity: 9 });
    });

    it('restoreCart merges the snapshot into existing entries rather than replacing them', async () => {
      const store = createTestStore();
      await seedCart(store, { 1: { productId: 10, quantity: 2 } });

      await store.dispatch(
        cartApi.endpoints.restoreCart.initiate({ 2: { productId: 20, quantity: 5 } }),
      );

      expect(getCartCache(store)).toEqual({
        1: { productId: 10, quantity: 2 },
        2: { productId: 20, quantity: 5 },
      });
    });

    it('clearCart empties every entry', async () => {
      const store = createTestStore();
      await seedCart(store, {
        1: { productId: 10, quantity: 2 },
        2: { productId: 20, quantity: 1 },
      });

      await store.dispatch(cartApi.endpoints.clearCart.initiate());

      expect(getCartCache(store)).toEqual({});
    });
  });

  describe('empty-payload no-ops', () => {
    it('syncCart never writes when the local cart is empty', async () => {
      const store = createTestStore();

      await store.dispatch(cartApi.endpoints.syncCart.initiate({}));

      expect(supabaseStub.__getCalls('cart_items')).toHaveLength(0);
    });

    it('restoreCart never writes when the snapshot is empty', async () => {
      const store = createTestStore();

      await store.dispatch(cartApi.endpoints.restoreCart.initiate({}));

      const writeCalls = supabaseStub
        .__getCalls('cart_items')
        .filter((call) => call.method === 'upsert');
      expect(writeCalls).toHaveLength(0);
    });
  });
});
