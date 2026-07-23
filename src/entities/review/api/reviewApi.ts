import { supabase, baseApi } from "@/shared/api";
import type { Database } from "@/shared/api";
import {
    ProductReview,
    UnreviewedPurchase,
    ReviewRatingStats,
    ReviewsQueryArgs,
    PaginatedReviews,
    ReviewSort,
    REVIEWS_PAGE_SIZE
} from "@/entities/review/model/types";
import { buildRatingStats } from "@/entities/review/lib/reviewsHelper";
import { getErrorMessage } from "@/shared/lib";

const pendingLikes = new Set<number>();

const REVIEW_SELECT = `
    *,
    public_profiles (
        username
    )
`;

type ProductReviewRow = Database['public']['Tables']['product_reviews']['Row'] & {
    public_profiles: Pick<
        Database['public']['Views']['public_profiles']['Row'],
        'username'
    > | null;
};

const mapReview = (
    review: ProductReviewRow,
    likedIds: Set<number>
): ProductReview => {
    const finalName = review.public_profiles?.username || review.reviewer_name || 'Anonymous';

    return {
        id: review.id,
        productId: review.product_id,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        userId: review.user_id,
        helpfulCount: review.helpful_count,
        reviewerName: finalName,
        isLiked: likedIds.has(review.id),
        isEdited: review.is_edited,
        isVerified: review.is_verified,
    };
};

const insertBySort = (items: ProductReview[], review: ProductReview, sort: ReviewSort) => {
    if (sort === 'oldest' || sort === 'most_helpful') {
        items.push(review);
    } else {
        items.unshift(review);
    }
};

const recalculatePercentages = (distribution: ReviewRatingStats['distribution'], total: number) => {
    distribution.forEach((row) => {
        row.percentage = total > 0 ? Math.round((row.count / total) * 100) : 0;
    });
};

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query<PaginatedReviews, ReviewsQueryArgs>({
            async queryFn({ productId, page = 1, limit = REVIEWS_PAGE_SIZE, sort = 'newest', rating = null }) {
                try {
                    const from = (page - 1) * limit;
                    const to = page * limit - 1;

                    let query = supabase
                        .from('product_reviews')
                        .select(REVIEW_SELECT, { count: 'exact' })
                        .eq('product_id', productId);

                    if (rating) {
                        query = query.eq('rating', rating);
                    }

                    if (sort === 'most_helpful') {
                        query = query.order('helpful_count', { ascending: false }).order('date', { ascending: false });
                    } else {
                        query = query.order('date', { ascending: sort === 'oldest' });
                    }

                    query = query.order('id', { ascending: sort === 'oldest' }).range(from, to);

                    const [{ data: reviewsData, error: reviewsError, count }, { data: { user } }] = await Promise.all([
                        query,
                        supabase.auth.getUser()
                    ]);

                    if (reviewsError) throw reviewsError;
                    if (!reviewsData) return { data: { items: [], totalCount: 0 } };

                    const userLikes = new Set<number>();

                    if (user && reviewsData.length > 0) {
                        const reviewIds = reviewsData.map(r => r.id);

                        const { data: likesData } = await supabase
                            .from('review_likes')
                            .select('review_id')
                            .eq('user_id', user.id)
                            .in('review_id', reviewIds);

                        if (likesData) {
                            likesData.forEach(like => userLikes.add(like.review_id));
                        }
                    }

                    const items = reviewsData
                        .map((review) => mapReview(review, userLikes));

                    return { data: { items, totalCount: count ?? 0 } };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}-${queryArgs.productId}-${queryArgs.sort ?? 'newest'}-${queryArgs.rating ?? 'all'}`,
            merge: (currentCache, newResponse) => {
                // The caller always fetches cumulatively (page: 1, limit scaled to
                // cover every page loaded so far), so every response is already the
                // full accumulated list — a plain replace is correct and also drops
                // any optimistic placeholder (negative id) left over from before the
                // real server data arrived.
                currentCache.items = newResponse.items;
                currentCache.totalCount = newResponse.totalCount;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page
                    || currentArg?.limit !== previousArg?.limit;
            },
            providesTags: (_result, _error, { productId }) => [{ type: 'Review', id: productId }]
        }),

        getReviewStats: builder.query<ReviewRatingStats, number>({
            async queryFn(productId) {
                try {
                    const { data, error } = await supabase.rpc('get_review_stats', {
                        p_product_id: productId
                    });

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: buildRatingStats(data ?? []) };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            providesTags: (_result, _error, productId) => [{ type: 'Review', id: productId }]
        }),

        getMyReviews: builder.query<ProductReview[], void>({
            async queryFn() {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return { data: [] };

                    const { data, error } = await supabase
                        .from('product_reviews')
                        .select(REVIEW_SELECT)
                        .eq('user_id', user.id)
                        .order('date', { ascending: false });

                    if (error) throw error;
                    if (!data) return { data: [] };

                    const reviews = data
                        .map((review) => mapReview(review, new Set<number>()));

                    return { data: reviews };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            providesTags: [{ type: 'Review', id: 'MY_LIST' }]
        }),

        getUnreviewedPurchases: builder.query<UnreviewedPurchase[], void>({
            async queryFn() {
                try {
                    const { data, error } = await supabase.rpc('get_unreviewed_purchases');

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    const purchases = (data ?? []).map((row) => ({
                        productId: row.product_id,
                        lastPurchasedAt: row.last_purchased_at,
                        purchaseCount: row.purchase_count,
                    }));

                    return { data: purchases };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            providesTags: [{ type: 'Review', id: 'PENDING_LIST' }]
        }),

        addOrUpdateReview: builder.mutation<void, { productId: number; rating: number; comment: string; reviewerName?: string; userId?: string }>({
            async queryFn({ productId, rating, comment }) {
                try {
                    const { error } = await supabase.rpc('add_or_update_review', {
                        p_product_id: productId,
                        p_rating: rating,
                        p_comment: comment
                    });

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: undefined };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            invalidatesTags: (_result, _error, { productId }) => [
                { type: 'Review', id: productId },
                { type: 'Review', id: 'MY_LIST' },
                { type: 'Review', id: 'PENDING_LIST' },
                // on_review_change (schema.sql) recomputes products.rating /
                // reviews_count server-side on every insert/update/delete —
                // invalidate the product so that number stays in sync with
                // the optimistically-patched stats shown inside this block.
                { type: 'Product', id: productId },
                'PurchaseHistory'
            ],
            async onQueryStarted({ productId, rating, comment, reviewerName, userId }, { dispatch, queryFulfilled, getState }) {
                // RTK Query types getState() against the API slice only; the
                // ambient GlobalRootState (declared in app/store.ts) gives the
                // real root shape without an upward import.
                const state = getState() as GlobalRootState;
                const authUser = state.auth?.user;

                const resolvedUserId = userId || authUser?.id || 'temp-user-id';
                const resolvedName = reviewerName || authUser?.username || 'Anonymous';

                // The user's existing review may live on a page/cache entry that
                // isn't currently loaded (e.g. editing while a differently sorted
                // or filtered view is subscribed) — getMyReviews is the reliable
                // source for "does a review already exist" and its prior rating.
                const myReviews = reviewApi.endpoints.getMyReviews.select()(getState()).data;
                const existingReview = myReviews?.find((review) => review.productId === productId);
                const previousRating = existingReview?.rating ?? null;

                // getReviews caches one entry per distinct query args (productId +
                // sort + rating); patch every cached entry for this product, not
                // just a single bare-productId key.
                const patches = reviewApi.util
                    .selectInvalidatedBy(getState(), [{ type: 'Review', id: productId }])
                    .filter((entry) => entry.endpointName === 'getReviews')
                    .map(({ originalArgs }) =>
                        dispatch(
                            reviewApi.util.updateQueryData('getReviews', originalArgs, (draft) => {
                                const sort = originalArgs.sort ?? 'newest';
                                const activeFilter = originalArgs.rating ?? null;
                                const matchesFilter = activeFilter === null || activeFilter === rating;
                                const existingIndex = draft.items.findIndex((review) => review.userId === resolvedUserId);

                                if (existingIndex !== -1) {
                                    const updated: ProductReview = {
                                        ...draft.items[existingIndex],
                                        rating,
                                        comment,
                                        date: new Date().toISOString(),
                                        isEdited: true
                                    };

                                    if (!matchesFilter) {
                                        draft.items.splice(existingIndex, 1);
                                        draft.totalCount = Math.max(0, draft.totalCount - 1);
                                    } else if (sort === 'most_helpful') {
                                        draft.items[existingIndex] = updated;
                                    } else {
                                        draft.items.splice(existingIndex, 1);
                                        insertBySort(draft.items, updated, sort);
                                    }
                                } else if (!existingReview && matchesFilter) {
                                    insertBySort(draft.items, {
                                        id: -Date.now(),
                                        productId,
                                        rating,
                                        comment,
                                        date: new Date().toISOString(),
                                        userId: resolvedUserId,
                                        helpfulCount: 0,
                                        reviewerName: resolvedName,
                                        isLiked: false,
                                        isEdited: false,
                                        isVerified: true
                                    }, sort);
                                    draft.totalCount += 1;
                                }
                                // else: the user already has a review for this product
                                // elsewhere (not loaded in this cache entry) — leave
                                // items/totalCount alone, the invalidation refetch
                                // reconciles it once it lands.
                            })
                        )
                    );

                const statsPatch = dispatch(
                    reviewApi.util.updateQueryData('getReviewStats', productId, (draft) => {
                        if (previousRating !== null) {
                            const oldRow = draft.distribution.find((row) => row.stars === previousRating);
                            if (oldRow) oldRow.count = Math.max(0, oldRow.count - 1);
                        } else {
                            draft.total += 1;
                        }
                        const newRow = draft.distribution.find((row) => row.stars === rating);
                        if (newRow) newRow.count += 1;
                        recalculatePercentages(draft.distribution, draft.total);
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach((patch) => patch.undo());
                    statsPatch.undo();
                }
            }
        }),

        toggleReviewLike: builder.mutation<boolean, { reviewId: number; productId: number }>({
            async queryFn({ reviewId }) {
                // The mutex has to be claimed and released here, not in
                // onQueryStarted: queryFn is the only hook that actually fires the
                // network call, so it's the only place that can stop a genuine
                // double-dispatch from hitting Supabase twice. Check-then-add is
                // safe as a single synchronous block before the first await.
                if (pendingLikes.has(reviewId)) {
                    return { error: { status: 'CUSTOM_ERROR', data: 'Request already in progress' } };
                }
                pendingLikes.add(reviewId);
                try {
                    const { data, error } = await supabase.rpc('toggle_review_like', {
                        p_review_id: reviewId
                    });

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: !!data };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                } finally {
                    pendingLikes.delete(reviewId);
                }
            },
            async onQueryStarted({ reviewId, productId }, { dispatch, queryFulfilled, getState }) {
                // onQueryStarted's synchronous prefix runs before queryFn is ever
                // invoked, so by the time a second, overlapping dispatch reaches
                // this point, an in-flight first request has already claimed the
                // mutex in its own queryFn. Skip the optimistic patch for it —
                // queryFn will reject it and no rollback will be needed.
                if (pendingLikes.has(reviewId)) return;

                const cacheEntries = () => reviewApi.util
                    .selectInvalidatedBy(getState(), [{ type: 'Review', id: productId }])
                    .filter((entry) => entry.endpointName === 'getReviews');

                const patches = cacheEntries().map(({ originalArgs }) =>
                    dispatch(
                        reviewApi.util.updateQueryData('getReviews', originalArgs, (draft) => {
                            const review = draft.items.find((r) => r.id === reviewId);
                            if (review) {
                                if (review.isLiked) {
                                    review.isLiked = false;
                                    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
                                } else {
                                    review.isLiked = true;
                                    review.helpfulCount += 1;
                                }
                            }
                        })
                    )
                );

                try {
                    const { data: isLiked } = await queryFulfilled;
                    cacheEntries().forEach(({ originalArgs }) =>
                        dispatch(
                            reviewApi.util.updateQueryData('getReviews', originalArgs, (draft) => {
                                const review = draft.items.find((r) => r.id === reviewId);
                                if (review) {
                                    review.isLiked = isLiked;
                                }
                            })
                        )
                    );
                } catch {
                    patches.forEach((patch) => patch.undo());
                }
            }
        }),

        deleteReview: builder.mutation<void, { reviewId: number; productId: number }>({
            async queryFn({ reviewId }) {
                try {
                    const { error } = await supabase
                        .from('product_reviews')
                        .delete()
                        .eq('id', reviewId);

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: undefined };
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            invalidatesTags: (_result, _error, { productId }) => [
                { type: 'Review', id: productId },
                { type: 'Review', id: 'MY_LIST' },
                { type: 'Review', id: 'PENDING_LIST' },
                // on_review_change (schema.sql) recomputes products.rating /
                // reviews_count server-side on every insert/update/delete —
                // invalidate the product so that number stays in sync with
                // the optimistically-patched stats shown inside this block.
                { type: 'Product', id: productId },
                'PurchaseHistory'
            ],
            async onQueryStarted({ reviewId, productId }, { dispatch, queryFulfilled, getState }) {
                const invalidatedEntries = reviewApi.util
                    .selectInvalidatedBy(getState(), [{ type: 'Review', id: productId }])
                    .filter((entry) => entry.endpointName === 'getReviews');

                const myReviews = reviewApi.endpoints.getMyReviews.select()(getState()).data;
                const deletedRating = myReviews?.find((review) => review.id === reviewId)?.rating
                    ?? invalidatedEntries
                        .map(({ originalArgs }) =>
                            reviewApi.endpoints.getReviews.select(originalArgs)(getState()).data
                                ?.items.find((review) => review.id === reviewId)?.rating
                        )
                        .find((foundRating): foundRating is number => foundRating !== undefined);

                const patches = invalidatedEntries.map(({ originalArgs }) =>
                    dispatch(
                        reviewApi.util.updateQueryData('getReviews', originalArgs, (draft) => {
                            const index = draft.items.findIndex((r) => r.id === reviewId);
                            if (index !== -1) {
                                draft.items.splice(index, 1);
                                draft.totalCount = Math.max(0, draft.totalCount - 1);
                            }
                        })
                    )
                );

                const statsPatch = deletedRating !== undefined
                    ? dispatch(
                        reviewApi.util.updateQueryData('getReviewStats', productId, (draft) => {
                            draft.total = Math.max(0, draft.total - 1);
                            const row = draft.distribution.find((r) => r.stars === deletedRating);
                            if (row) row.count = Math.max(0, row.count - 1);
                            recalculatePercentages(draft.distribution, draft.total);
                        })
                    )
                    : undefined;

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach((patch) => patch.undo());
                    statsPatch?.undo();
                }
            }
        })
    })
});

export const {
    useGetReviewsQuery,
    useGetReviewStatsQuery,
    useGetMyReviewsQuery,
    useGetUnreviewedPurchasesQuery,
    useAddOrUpdateReviewMutation,
    useToggleReviewLikeMutation,
    useDeleteReviewMutation
} = reviewApi;