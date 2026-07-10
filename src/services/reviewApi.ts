import { supabase } from "@/supabase";
import { ProductReview } from "@/types/products";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { productsApi } from "./productsApi";

const pendingLikes = new Set<number>();

interface ProductReviewResponse {
    id: number;
    product_id: number;
    rating: number;
    comment: string | null;
    date: string;
    user_id: string | null;
    helpful_count: number;
    reviewer_name: string | null;
    reviewer_email: string | null;
    is_edited: boolean;
}

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['Review'],
    endpoints: (builder) => ({
        getReviews: builder.query<ProductReview[], number>({
            async queryFn(id) {
                try {
                    const { data: reviewsData, error: reviewsError } = await supabase
                        .from('product_reviews')
                        .select(`
                    *,
                    profiles (
                        first_name,
                        last_name,
                        username,
                        avatar_url
                    )
                `)
                        .eq('product_id', id)
                        .order('date', { ascending: false });

                    if (reviewsError) throw reviewsError;
                    if (!reviewsData) return { data: [] };

                    const { data: { user } } = await supabase.auth.getUser();

                    let userLikes = new Set<number>();

                    if (user && reviewsData.length > 0) {
                        const reviewIds = (reviewsData as ProductReviewResponse[]).map(r => r.id);

                        const { data: likesData } = await supabase
                            .from('review_likes')
                            .select('review_id')
                            .eq('user_id', user.id)
                            .in('review_id', reviewIds);

                        if (likesData) {
                            likesData.forEach(like => userLikes.add(like.review_id));
                        }
                    }

                    const reviews: ProductReview[] = reviewsData.map((review: any) => {
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
                            isLiked: userLikes.has(review.id),
                            isEdited: review.is_edited,
                        };
                    });

                    return { data: reviews };
                } catch (error: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: error.message }
                    };
                }
            },
            providesTags: (result, error, productId) => [{ type: 'Review', id: productId }]
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
                } catch (error: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: error.message }
                    };
                }
            },
            invalidatesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }],
            async onQueryStarted({ productId, rating, comment, reviewerName, userId }, { dispatch, queryFulfilled, getState }) {
                const state = getState() as any;
                const authUser = state.auth?.user;

                const resolvedUserId = userId || authUser?.id || 'temp-user-id';
                const resolvedName = reviewerName || (authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : null) || authUser?.username || 'Anonymous';
                const resolvedEmail = authUser?.email || null;

                const patchResult = dispatch(
                    reviewApi.util.updateQueryData('getReviews', productId, (draft) => {
                        const existingIndex = draft.findIndex((review) => review.userId === resolvedUserId);

                        if (existingIndex !== -1) {
                            draft[existingIndex] = {
                                ...draft[existingIndex],
                                rating,
                                comment,
                                date: new Date().toISOString(),
                                isEdited: true
                            };
                        } else {
                            draft.unshift({
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
                        }
                    })
                );

                try {
                    await queryFulfilled;
                    dispatch(productsApi.util.invalidateTags(['PurchaseHistory']));
                } catch {
                    patchResult.undo();
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
                } catch (error: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: error.message }
                    };
                } finally {
                    pendingLikes.delete(reviewId);
                }
            },
            async onQueryStarted({ reviewId, productId }, { dispatch, queryFulfilled }) {
                if (pendingLikes.has(reviewId)) return;

                const patchResult = dispatch(
                    reviewApi.util.updateQueryData('getReviews', productId, (draft) => {
                        const review = draft.find((r) => r.id === reviewId);
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
                );

                try {
                    const { data: isLiked } = await queryFulfilled;
                    dispatch(
                        reviewApi.util.updateQueryData('getReviews', productId, (draft) => {
                            const review = draft.find((r) => r.id === reviewId);
                            if (review) {
                                review.isLiked = isLiked;
                            }
                        })
                    );
                } catch {
                    patchResult.undo();
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
                } catch (error: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: error.message }
                    };
                }
            },
            invalidatesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }],
            async onQueryStarted({ reviewId, productId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    reviewApi.util.updateQueryData('getReviews', productId, (draft) => {
                        const index = draft.findIndex((r) => r.id === reviewId);
                        if (index !== -1) {
                            draft.splice(index, 1);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                    dispatch(productsApi.util.invalidateTags(['PurchaseHistory']));
                } catch {
                    patchResult.undo();
                }
            }
        })
    })
});

export const {
    useGetReviewsQuery,
    useAddOrUpdateReviewMutation,
    useToggleReviewLikeMutation,
    useDeleteReviewMutation
} = reviewApi;