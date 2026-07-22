import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { FaComments } from 'react-icons/fa';

import { ReviewsStats, ReviewsControls } from '@/entities/review';
import { ReviewsSort } from '@/features/product-reviews-sort';
import style from './product-reviews.module.scss';
import ProductReviewsSkeleton from './ProductReviewsSkeleton';
import { ReviewCard } from '@/entities/review';
import { useGetReviewsQuery, useGetReviewStatsQuery } from "@/entities/review";
import type { ReviewSort } from '@/entities/review';
import { openReviewModal } from '@/features/order-review';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { selectUser } from '@/entities/session';

interface ProductReviewsProps {
    productId: number;
    rating: number;
}

const VALID_SORTS: ReviewSort[] = ['newest', 'oldest', 'most_helpful'];

const parseSort = (value: string | null): ReviewSort =>
    VALID_SORTS.includes(value as ReviewSort) ? (value as ReviewSort) : 'newest';

export const ProductReviews = ({ productId, rating }: ProductReviewsProps) => {
    const [page, setPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const sort = parseSort(searchParams.get('reviewSort'));
    const { data: stats } = useGetReviewStatsQuery(productId);
    const { data: reviewsData, isFetching } = useGetReviewsQuery({ productId, page, sort });

    const handleSortChange = (nextSort: ReviewSort) => {
        setPage(1);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('reviewSort', nextSort);
            return next;
        }, { replace: true });
    };

    if (!reviewsData || !stats) return <ProductReviewsSkeleton />;

    const { items, totalCount } = reviewsData;

    return (
        <section id="reviews" className={style['reviews']}>
            <div className={style['reviews__header']}>
                <h2 className={style['reviews__title']}>
                    <FaComments className={style['reviews__title-icon']} />
                    <span>Customer Feedback</span>
                </h2>
                <span className={style['reviews__count-badge']}>
                    {stats.total} total
                </span>
            </div>

            <div className={style['reviews__layout']}>
                {/* Decomposed Left Column: Rating Statistics Summary */}
                <ReviewsStats stats={stats} rating={rating} />

                {/* Right Column: Controls and Reviews List */}
                <div className={style['reviews__list-panel']}>
                    <ReviewsControls sortSlot={<ReviewsSort value={sort} onChange={handleSortChange} />} />
                        {items.length === 0 ? (
                            <div className={style['reviews__empty']}>No reviews yet. Be the first to write one!</div>
                        ) : (
                            <div className={style['reviews__list']} aria-live="polite">
                                {items.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        isCurrentUser={user?.id === review.userId}
                                        onEdit={() => dispatch(openReviewModal(review.productId.toString()))}
                                    />
                                ))}
                            </div>
                        )}
                        {items.length < totalCount && (
                            <button
                                type="button"
                                className={style['reviews__load-more']}
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={isFetching}
                            >
                                {isFetching ? 'Loading…' : `Load more (${items.length} of ${totalCount})`}
                            </button>
                        )}
                </div>
            </div>
        </section>
    );
};
