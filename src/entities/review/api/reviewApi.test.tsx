import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore } from '@test/renderWithProviders';
import { supabase } from '@/shared/api/supabase/client';
import { reviewApi } from '@/entities/review';
import { ProductReview, ReviewRatingStats, ReviewsQueryArgs } from '@/entities/review/model/types';

// A .tsx file — see cartApi.test.tsx's header comment: reviewApi.ts is
// reachable from @/app/store.ts, whose side-effect imports need
// vitest.setup.ts's @/shared/api/revalidate mock (component-project-only) —
// addOrUpdateReview/deleteReview both call revalidateProduct after success.

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const REVIEWS_ARGS: ReviewsQueryArgs = { productId: 1, sort: 'newest', rating: null };

const review = (overrides: Partial<ProductReview> = {}): ProductReview => ({
  id: 100,
  productId: 1,
  rating: 4,
  comment: 'Solid product',
  date: '2024-01-01T00:00:00.000Z',
  helpfulCount: 2,
  reviewerName: 'Bob',
  userId: 'other-user-id',
  isLiked: false,
  isEdited: false,
  isVerified: true,
  ...overrides,
});

const emptyStats = (): ReviewRatingStats => ({
  total: 0,
  distribution: [1, 2, 3, 4, 5].map((stars) => ({ stars, count: 0, percentage: 0 })),
});

const seedReviews = (
  store: ReturnType<typeof createTestStore>,
  args: ReviewsQueryArgs,
  items: ProductReview[],
) =>
  store.dispatch(
    reviewApi.util.upsertQueryData('getReviews', args, { items, totalCount: items.length }),
  );

const seedStats = (
  store: ReturnType<typeof createTestStore>,
  productId: number,
  stats: ReviewRatingStats,
) => store.dispatch(reviewApi.util.upsertQueryData('getReviewStats', productId, stats));

const getReviewsCache = (store: ReturnType<typeof createTestStore>) =>
  reviewApi.endpoints.getReviews.select(REVIEWS_ARGS)(store.getState()).data;

const getStatsCache = (store: ReturnType<typeof createTestStore>) =>
  reviewApi.endpoints.getReviewStats.select(1)(store.getState()).data;

beforeEach(() => {
  supabaseStub.__reset();
});

describe('reviewApi — toggleReviewLike', () => {
  it('optimistically toggles isLiked/helpfulCount, then reconciles with the server value', async () => {
    supabaseStub.__setRpc('toggle_review_like', { data: true });
    const store = createTestStore();
    await seedReviews(store, REVIEWS_ARGS, [review({ isLiked: false, helpfulCount: 2 })]);

    await store.dispatch(
      reviewApi.endpoints.toggleReviewLike.initiate({ reviewId: 100, productId: 1 }),
    );

    const cachedReview = getReviewsCache(store)?.items[0];
    expect(cachedReview?.isLiked).toBe(true);
    expect(cachedReview?.helpfulCount).toBe(3);
  });

  it('rolls back the optimistic toggle when the RPC call fails', async () => {
    supabaseStub.__setRpc('toggle_review_like', { error: { code: 'PGRST000', message: 'boom' } });
    const store = createTestStore();
    await seedReviews(store, REVIEWS_ARGS, [review({ isLiked: false, helpfulCount: 2 })]);

    await store.dispatch(
      reviewApi.endpoints.toggleReviewLike.initiate({ reviewId: 100, productId: 1 }),
    );

    const cachedReview = getReviewsCache(store)?.items[0];
    expect(cachedReview?.isLiked).toBe(false);
    expect(cachedReview?.helpfulCount).toBe(2);
  });

  it('rejects a second overlapping toggle for the same review instead of double-submitting', async () => {
    supabaseStub.__setRpc('toggle_review_like', { data: true });
    const store = createTestStore();
    await seedReviews(store, REVIEWS_ARGS, [review({ isLiked: false, helpfulCount: 2 })]);

    const [first, second] = await Promise.all([
      store.dispatch(
        reviewApi.endpoints.toggleReviewLike.initiate({ reviewId: 100, productId: 1 }),
      ),
      store.dispatch(
        reviewApi.endpoints.toggleReviewLike.initiate({ reviewId: 100, productId: 1 }),
      ),
    ]);

    const results = [first, second];
    expect(results.filter((r) => 'error' in r && r.error)).toHaveLength(1);
    expect(results.filter((r) => 'data' in r && r.data !== undefined)).toHaveLength(1);
  });
});

// Unlike cartApi/wishlistApi's mutations, addOrUpdateReview/deleteReview
// both declare invalidatesTags unconditionally (not branched on error), and
// that tag matches getReviews/getReviewStats' own providesTags — so once
// the mutation settles (success OR failure), RTK Query evicts the
// unsubscribed cache entry these tests seed via upsertQueryData outright,
// rather than leaving it in place for a rollback to be visible on. The
// optimistic patch itself (what a real subscribed component would show
// mid-flight) is still applied synchronously, before that settle — assert
// on that instead of the post-settle cache, which these tests can't
// observe reliably either way (purged on success, purged on failure alike).
describe('reviewApi — addOrUpdateReview', () => {
  it('optimistically inserts a brand-new review and bumps its stats bucket, before the RPC call settles', async () => {
    const store = createTestStore();
    await seedReviews(store, REVIEWS_ARGS, []);
    await seedStats(store, 1, emptyStats());

    const dispatched = store.dispatch(
      reviewApi.endpoints.addOrUpdateReview.initiate({
        productId: 1,
        rating: 5,
        comment: 'Amazing',
        userId: 'new-user-id',
        reviewerName: 'Alice',
      }),
    );

    const cachedReview = getReviewsCache(store)?.items[0];
    expect(cachedReview).toEqual(
      expect.objectContaining({ rating: 5, comment: 'Amazing', userId: 'new-user-id' }),
    );
    const stats = getStatsCache(store);
    expect(stats?.total).toBe(1);
    expect(stats?.distribution.find((row) => row.stars === 5)?.count).toBe(1);

    await dispatched;
  });

  it('still applies the optimistic insert immediately even when the RPC call is going to fail, and surfaces the error', async () => {
    supabaseStub.__setRpc('add_or_update_review', { error: { code: 'PGRST000', message: 'boom' } });
    const store = createTestStore();
    await seedReviews(store, REVIEWS_ARGS, []);
    await seedStats(store, 1, emptyStats());

    const dispatched = store.dispatch(
      reviewApi.endpoints.addOrUpdateReview.initiate({
        productId: 1,
        rating: 5,
        comment: 'Amazing',
        userId: 'new-user-id',
      }),
    );

    expect(getReviewsCache(store)?.items).toHaveLength(1);

    const result = await dispatched;
    expect('error' in result && result.error).toBeTruthy();
  });
});

describe('reviewApi — deleteReview', () => {
  it('optimistically removes the review and decrements its stats bucket, before the delete settles', async () => {
    const store = createTestStore();
    await seedReviews(store, REVIEWS_ARGS, [review({ id: 100, rating: 4 })]);
    const stats = emptyStats();
    stats.total = 1;
    stats.distribution.find((row) => row.stars === 4)!.count = 1;
    await seedStats(store, 1, stats);

    const dispatched = store.dispatch(
      reviewApi.endpoints.deleteReview.initiate({ reviewId: 100, productId: 1 }),
    );

    expect(getReviewsCache(store)?.items).toEqual([]);
    expect(getReviewsCache(store)?.totalCount).toBe(0);
    const cachedStats = getStatsCache(store);
    expect(cachedStats?.total).toBe(0);
    expect(cachedStats?.distribution.find((row) => row.stars === 4)?.count).toBe(0);

    await dispatched;
  });

  it('still applies the optimistic removal immediately even when the delete is going to fail, and surfaces the error', async () => {
    supabaseStub.__setTable('product_reviews', { error: { code: 'PGRST000', message: 'boom' } });
    const store = createTestStore();
    const seeded = review({ id: 100, rating: 4 });
    await seedReviews(store, REVIEWS_ARGS, [seeded]);

    const dispatched = store.dispatch(
      reviewApi.endpoints.deleteReview.initiate({ reviewId: 100, productId: 1 }),
    );

    expect(getReviewsCache(store)?.items).toEqual([]);

    const result = await dispatched;
    expect('error' in result && result.error).toBeTruthy();
  });
});
