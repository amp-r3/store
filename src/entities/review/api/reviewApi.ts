import { supabase, baseApi } from "@/shared/api";
import type { Database } from "@/shared/api";
import {
    ProductReview,
    UnreviewedPurchase,
    ReviewRatingStats,
    ReviewsQueryArgs,
    PaginatedReviews,
    REVIEWS_PAGE_SIZE
} from "@/entities/review/model/types";
import { buildRatingStats } from "@/entities/review/lib/reviewsHelper";
import { getErrorMessage } from "@/shared/lib";

const pendingLikes = new Set<number>();

const REVIEW_SELECT = `
    *,
    profiles (
        first_name,
        last_name,
        username,
        avatar_url
    )
`;

type ProductReviewRow = Database['public']['Tables']['product_reviews']['Row'] & {
    profiles: Pick<
        Database['public']['Tables']['profiles']['Row'],
        'first_name' | 'last_name' | 'username' | 'avatar_url'
    > | null;
};

const mapReview = (
    review: ProductReviewRow,
    likedIds: Set<number>
): ProductReview => {
    let finalName = review.reviewer_name || 'Anonymous';

    if (review.profiles) {
        const { first_name, last_name, username } = review.profiles;
        if (first_name || last_name) {
            finalName = `${first_name || ''} ${last_name || ''}`.trim();
        } else if (username) {
            finalName = username;
        }
    }

    return {
        id: review.id,
        productId: review.product_id,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        userId: review.user_id,
        helpfulCount: review.helpful_count,
        reviewerName: finalName,
        reviewerEmail: review.reviewer_email,
        isLiked: likedIds.has(review.id),
        isEdited: review.is_edited,
    };
};

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query<PaginatedReviews, ReviewsQueryArgs>({
            async queryFn({ productId, page = 1, limit = REVIEWS_PAGE_SIZE, sort = 'newest' }) {
                try {
                    const from = (page - 1) * limit;
                    const to = page * limit - 1;

                    let query = supabase
                        .from('product_reviews')
                        .select(REVIEW_SELECT, { count: 'exact' })
                        .eq('product_id', productId);

                    if (sort === 'most_helpful') {
                        query = query.order('helpful_count', { ascending: false }).order('date', { ascending: false });
                    } else {
                        query = query.order('date', { ascending: sort === 'oldest' });
                    }

                    const { data: reviewsData, error: reviewsError, count } = await query
                        .order('id', { ascending: false })
                        .range(from, to);

                    if (reviewsError) throw reviewsError;
                    if (!reviewsData) return { data: { items: [], totalCount: 0 } };

                    const { data: { user } } = await supabase.auth.getUser();

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
                `${endpointName}-${queryArgs.productId}-${queryArgs.sort ?? 'newest'}`,
            merge: (currentCache, newResponse, { arg }) => {
                if (!arg.page || arg.page === 1) {
                    currentCache.items = newResponse.items;
                } else {
                    const existingIds = new Set(currentCache.items.map((item) => item.id));
                    const uniqueNewItems = newResponse.items.filter((item) => !existingIds.has(item.id));
                    currentCache.items.push(...uniqueNewItems);
                }
                currentCache.totalCount = newResponse.totalCount;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page
                    || currentArg?.limit !== previousArg?.limit
                    || currentArg?.sort !== previousArg?.sort;
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
                'PurchaseHistory'
            ],
            async onQueryStarted({ productId, rating, comment, reviewerName, userId }, { dispatch, queryFulfilled, getState }) {
                // RTK Query types getState() against the API slice only; the
                // ambient GlobalRootState (declared in app/store.ts) gives the
                // real root shape without an upward import.
                const state = getState() as GlobalRootState;
                const authUser = state.auth?.user;

                const resolvedUserId = userId || authUser?.id || 'temp-user-id';
                const resolvedName = reviewerName || (authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : null) || authUser?.username || 'Anonymous';
                const resolvedEmail = authUser?.email || null;

                // getReviews caches one entry per distinct query args (productId +
                // sort + rating); patch every cached entry for this product, not
                // just a single bare-productId key.
                const patches = reviewApi.util
                    .selectInvalidatedBy(getState(), [{ type: 'Review', id: productId }])
                    .filter((entry) => entry.endpointName === 'getReviews')
                    .map(({ originalArgs }) =>
                        dispatch(
                            reviewApi.util.updateQueryData('getReviews', originalArgs, (draft) => {
                                const existingIndex = draft.items.findIndex((review) => review.userId === resolvedUserId);

                                if (existingIndex !== -1) {
                                    draft.items[existingIndex] = {
                                        ...draft.items[existingIndex],
                                        rating,
                                        comment,
                                        date: new Date().toISOString(),
                                        isEdited: true
                                    };
                                } else {
                                    draft.items.unshift({
                                        id: Date.now(),
                                        productId,
                                        rating,
                                        comment,
                                        date: new Date().toISOString(),
                                        userId: resolvedUserId,
                                        helpfulCount: 0,
                                        reviewerName: resolvedName,
                                        reviewerEmail: resolvedEmail,
                                        isLiked: false,
                                        isEdited: false
                                    });
                                    draft.totalCount += 1;
                                }
                            })
                        )
                    );

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach((patch) => patch.undo());
                }
            }
        }),

        toggleReviewLike: builder.mutation<boolean, { reviewId: number; productId: number }>({
            async queryFn({ reviewId }) {
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
                'PurchaseHistory'
            ],
            async onQueryStarted({ reviewId, productId }, { dispatch, queryFulfilled, getState }) {
                const patches = reviewApi.util
                    .selectInvalidatedBy(getState(), [{ type: 'Review', id: productId }])
                    .filter((entry) => entry.endpointName === 'getReviews')
                    .map(({ originalArgs }) =>
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

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach((patch) => patch.undo());
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