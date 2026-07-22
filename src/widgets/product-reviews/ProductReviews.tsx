import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { FaComments, FaArrowUp } from 'react-icons/fa';

import { ReviewsStats, ReviewsControls } from '@/entities/review';
import { ReviewsSort } from '@/features/product-reviews-sort';
import style from './product-reviews.module.scss';
import ProductReviewsSkeleton from './ProductReviewsSkeleton';
import { ReviewCard, ReviewCardSkeleton } from '@/entities/review';
import { useGetReviewsQuery, useGetReviewStatsQuery } from "@/entities/review";
import type { ReviewSort } from '@/entities/review';
import { REVIEWS_PAGE_SIZE } from '@/entities/review';
import { openReviewModal } from '@/features/order-review';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { selectUser } from '@/entities/session';
import { scrollToElement } from '@/shared/lib';

interface ProductReviewsProps {
    productId: number;
    rating: number;
}

const VALID_SORTS: ReviewSort[] = ['newest', 'oldest', 'most_helpful'];

const parseSort = (value: string | null): ReviewSort =>
    VALID_SORTS.includes(value as ReviewSort) ? (value as ReviewSort) : 'newest';

const parseRating = (value: string | null): number | null => {
    const parsed = Number(value);
    return value && Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
};

export const ProductReviews = ({ productId, rating }: ProductReviewsProps) => {
    const [page, setPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const sort = parseSort(searchParams.get('reviewSort'));
    const activeRating = parseRating(searchParams.get('stars'));
    const { data: stats } = useGetReviewStatsQuery(productId);
    const { data: reviewsData, isFetching } = useGetReviewsQuery({ productId, page, sort, rating: activeRating });

    const handleSortChange = (nextSort: ReviewSort) => {
        setPage(1);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('reviewSort', nextSort);
            return next;
        }, { replace: true });
    };

    const handleRatingChange = (nextRating: number | null) => {
        setPage(1);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (nextRating) {
                next.set('stars', String(nextRating));
            } else {
                next.delete('stars');
            }
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
                <ReviewsStats
                    stats={stats}
                    rating={rating}
                    activeRating={activeRating}
                    onRatingChange={handleRatingChange}
                />

                {/* Right Column: Controls and Reviews List */}
                <div className={style['reviews__list-panel']}>
                    <ReviewsControls
                        stats={stats}
                        activeRating={activeRating}
                        onRatingChange={handleRatingChange}
                        sortSlot={<ReviewsSort value={sort} onChange={handleSortChange} />}
                    />
                        {items.length === 0 ? (
                            <div className={style['reviews__empty']}>
                                {activeRating
                                    ? 'No reviews with this rating.'
                                    : 'No reviews yet. Be the first to write one!'}
                            </div>
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
                                {isFetching && page > 1 && Array.from({
                                    length: Math.min(REVIEWS_PAGE_SIZE, totalCount - items.length)
                                }).map((_, i) => (
                                    <ReviewCardSkeleton key={`load-more-skeleton-${i}`} />
                                ))}
                            </div>
                        )}
                        {items.length < totalCount && !isFetching && (
                            <button
                                type="button"
                                className={style['reviews__load-more']}
                                onClick={() => setPage((prev) => prev + 1)}
                            >
                                {`Load more (${items.length} of ${totalCount})`}
                            </button>
                        )}
                        {items.length > REVIEWS_PAGE_SIZE && (
                            <button
                                type="button"
                                className={style['reviews__back-to-top']}
                                onClick={() => scrollToElement('reviews')}
                            >
                                <FaArrowUp />
                                <span>Back to top</span>
                            </button>
                        )}
                </div>
            </div>
        </section>
    );
};
