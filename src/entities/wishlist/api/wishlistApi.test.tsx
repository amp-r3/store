import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore } from '@test/renderWithProviders';
import { seedWishlist } from '@test/seedApi';
import { supabase } from '@/shared/api/supabase/client';
import { wishlistApi } from '@/entities/wishlist';

// A .tsx file — see cartApi.test.tsx's header comment: wishlistApi.ts is
// reachable from @/app/store.ts, whose side-effect imports need
// vitest.setup.ts's @/shared/api/revalidate mock (component-project-only).

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const getWishlistCache = (store: ReturnType<typeof createTestStore>) =>
  wishlistApi.endpoints.getWishlist.select()(store.getState()).data;

beforeEach(() => {
  supabaseStub.__reset();
});

describe('wishlistApi', () => {
  describe('toggleWishlist — optimistic patch', () => {
    it('adding (isInWishlist: false) patches the product id into the cache', async () => {
      const store = createTestStore();
      await seedWishlist(store, {});

      await store.dispatch(
        wishlistApi.endpoints.toggleWishlist.initiate({ productId: 10, isInWishlist: false }),
      );

      expect(getWishlistCache(store)).toEqual({ 10: true });
    });

    it('removing (isInWishlist: true) deletes the product id from the cache', async () => {
      const store = createTestStore();
      await seedWishlist(store, { 10: true });

      await store.dispatch(
        wishlistApi.endpoints.toggleWishlist.initiate({ productId: 10, isInWishlist: true }),
      );

      expect(getWishlistCache(store)).toEqual({});
    });
  });

  describe('toggleWishlist — rollback on failure', () => {
    it('reverts an optimistic add when the write fails', async () => {
      const store = createTestStore();
      await seedWishlist(store, {});
      supabaseStub.__setTable('wishlist_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(
        wishlistApi.endpoints.toggleWishlist.initiate({ productId: 10, isInWishlist: false }),
      );

      expect(getWishlistCache(store)).toEqual({});
    });

    it('reverts an optimistic removal when the write fails', async () => {
      const store = createTestStore();
      await seedWishlist(store, { 10: true });
      supabaseStub.__setTable('wishlist_items', { error: { code: 'PGRST000', message: 'boom' } });

      await store.dispatch(
        wishlistApi.endpoints.toggleWishlist.initiate({ productId: 10, isInWishlist: true }),
      );

      expect(getWishlistCache(store)).toEqual({ 10: true });
    });
  });

  describe('syncWishlist', () => {
    it('never writes when the local wishlist is empty', async () => {
      const store = createTestStore();

      await store.dispatch(wishlistApi.endpoints.syncWishlist.initiate({}));

      expect(supabaseStub.__getCalls('wishlist_items')).toHaveLength(0);
    });

    it('upserts every local favorite for the signed-in user', async () => {
      const store = createTestStore();

      await store.dispatch(wishlistApi.endpoints.syncWishlist.initiate({ 10: true, 20: true }));

      const upsertCall = supabaseStub
        .__getCalls('wishlist_items')
        .find((call) => call.method === 'upsert');
      expect(upsertCall?.args[0]).toEqual([
        { user_id: 'test-user-id', product_id: 10 },
        { user_id: 'test-user-id', product_id: 20 },
      ]);
    });
  });

  describe('getWishlist', () => {
    it('formats rows into a productId -> true dictionary', async () => {
      supabaseStub.__setTable('wishlist_items', { data: [{ product_id: 10 }, { product_id: 20 }] });
      const store = createTestStore();

      const result = await store.dispatch(wishlistApi.endpoints.getWishlist.initiate());

      expect(result.data).toEqual({ 10: true, 20: true });
    });
  });
});
