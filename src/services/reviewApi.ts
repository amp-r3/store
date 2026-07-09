import { supabase } from "@/supabase";
import { ProductReview } from "@/types/products";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

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
}

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['Review'],
    endpoints: (builder) => ({
        getReviews: builder.query<ProductReview[], number>({
            async queryFn(id) {
                try {
                    const { data, error } = await supabase
                        .from('product_reviews')
                        .select('*')
                        .eq('product_id', id)
                        .order('date', { ascending: false });

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    const reviews: ProductReview[] = (data as ProductReviewResponse[]).map((review) => (
                        {
                            id: review.id,
                            productId: review.product_id,
                            rating: review.rating,
                            comment: review.comment,
                            date: review.date,
                            userId: review.user_id,
                            helpfulCount: review.helpful_count,
                            reviewerName: review.reviewer_name,
                            reviewerEmail: review.reviewer_email,
                            isLiked: false, // We can initialize as false or fetch user-specific liked status if DB schema supports it
                        }
                    ));

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
                                date: new Date().toISOString()
                            };
                        } else {
                            draft.unshift({
                                id: Date.now(), // Temporary numeric ID
                                productId,
                                rating,
                                comment,
                                date: new Date().toISOString(),
                                userId: resolvedUserId,
                                helpfulCount: 0,
                                reviewerName: resolvedName,
                                reviewerEmail: resolvedEmail,
                                isLiked: false
                            });
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        }),

        toggleReviewLike: builder.mutation<boolean, { reviewId: number; productId: number }>({
            async queryFn({ reviewId }) {
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
                }
            },
            async onQueryStarted({ reviewId, productId }, { dispatch, queryFulfilled }) {
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
