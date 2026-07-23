import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { FaComments, FaArrowUp } from 'react-icons/fa';

import { ReviewsStats, ReviewsStatsSkeleton, ReviewsControls } from '@/entities/review';
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
import { scrollToElement, getErrorMessage } from '@/shared/lib';

interface ProductReviewsProps {
    productId: number;
}

const VALID_SORTS: ReviewSort[] = ['newest', 'oldest', 'most_helpful'];

const parseSort = (value: string | null): ReviewSort =>
    VALID_SORTS.includes(value as ReviewSort) ? (value as ReviewSort) : 'newest';

const parseRating = (value: string | null): number | null => {
    const parsed = Number(value);
    return value && Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
};

const parsePage = (value: string | null): number => {
    const parsed = Number(value);
    return value && Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
};

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const sort = parseSort(searchParams.get('reviewSort'));
    const activeRating = parseRating(searchParams.get('stars'));
    const page = parsePage(searchParams.get('reviewPage'));

    const {
        data: stats,
        isError: isStatsError,
        error: statsError,
        refetch: refetchStats,
    } = useGetReviewStatsQuery(productId);

    const {
        data: reviewsData,
        isFetching,
        isError: isReviewsError,
        error: reviewsError,
        refetch: refetchReviews,
    } = useGetReviewsQuery({ productId, page: 1, limit: page * REVIEWS_PAGE_SIZE, sort, rating: activeRating });

    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const sectionRef = useRef<HTMLElement | null>(null);
    const loadMoreRequestedRef = useRef(false);
    const prevItemsLengthRef = useRef(0);

    useEffect(() => {
        if (loadMoreRequestedRef.current && !isFetching) {
            loadMoreRequestedRef.current = false;
            itemRefs.current[prevItemsLengthRef.current]?.focus();
        }
    }, [isFetching]);

    const handleSortChange = (nextSort: ReviewSort) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('reviewSort', nextSort);
            next.delete('reviewPage');
            return next;
        }, { replace: true });
    };

    const handleRatingChange = (nextRating: number | null) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (nextRating) {
                next.set('stars', String(nextRating));
            } else {
                next.delete('stars');
            }
            next.delete('reviewPage');
            return next;
        }, { replace: true });
    };

    const handleLoadMore = () => {
        prevItemsLengthRef.current = reviewsData?.items.length ?? 0;
        loadMoreRequestedRef.current = true;
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('reviewPage', String(page + 1));
            return next;
        }, { replace: true });
    };

    const handleBackToTop = () => {
        scrollToElement('reviews');
        sectionRef.current?.focus({ preventScroll: true });
    };

    const handleRetry = () => {
        if (isStatsError) refetchStats();
        if (isReviewsError) refetchReviews();
    };

    const hasError = isStatsError || isReviewsError;

    if (!stats && !reviewsData && !hasError) {
        return <ProductReviewsSkeleton />;
    }

    const items = reviewsData?.items ?? [];
    const totalCount = reviewsData?.totalCount ?? 0;

    return (
        <section
            id="reviews"
            ref={sectionRef}
            tabIndex={-1}
            aria-labelledby="reviews-heading"
            className={style['reviews']}
        >
            <div className={style['reviews__header']}>
                <h2 id="reviews-heading" className={style['reviews__title']}>
                    <FaComments className={style['reviews__title-icon']} />
                    <span>Customer Feedback</span>
                </h2>
                {stats && (
                    <span className={style['reviews__count-badge']}>
                        {activeRating ? `${totalCount} of ${stats.total}` : `${stats.total} total`}
                    </span>
                )}
            </div>

            {hasError ? (
                <div className={style['reviews__error']} role="alert">
                    <p>{getErrorMessage(statsError ?? reviewsError)}</p>
                    <button type="button" className={style['reviews__retry']} onClick={handleRetry}>
                        Try again
                    </button>
                </div>
            ) : (
                <div className={style['reviews__layout']}>
                    {stats ? (
                        <ReviewsStats
                            stats={stats}
                            activeRating={activeRating}
                            onRatingChange={handleRatingChange}
                        />
                    ) : (
                        <ReviewsStatsSkeleton />
                    )}

                    <div className={style['reviews__list-panel']}>
                        <ReviewsControls
                            shownCount={items.length}
                            totalCount={totalCount}
                            activeRating={activeRating}
                            onRatingChange={handleRatingChange}
                            sortSlot={<ReviewsSort value={sort} onChange={handleSortChange} />}
                        />
                        {!reviewsData ? (
                            <div className={style['reviews__list']} aria-busy="true">
                                {Array.from({ length: REVIEWS_PAGE_SIZE }).map((_, i) => (
                                    <ReviewCardSkeleton key={`filter-skeleton-${i}`} />
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className={style['reviews__empty']} role="status">
                                {activeRating
                                    ? 'No reviews with this rating.'
                                    : 'No reviews yet. Be the first to write one!'}
                            </div>
                        ) : (
                            <div className={style['reviews__list']}>
                                {items.map((review, index) => (
                                    <div
                                        key={review.id}
                                        ref={(el) => { itemRefs.current[index] = el; }}
                                        tabIndex={-1}
                                    >
                                        <ReviewCard
                                            review={review}
                                            isCurrentUser={user?.id === review.userId}
                                            onEdit={() => dispatch(openReviewModal(review.productId.toString()))}
                                        />
                                    </div>
                                ))}
                                {isFetching && items.length < totalCount && Array.from({
                                    length: Math.min(REVIEWS_PAGE_SIZE, totalCount - items.length)
                                }).map((_, i) => (
                                    <ReviewCardSkeleton key={`load-more-skeleton-${i}`} />
                                ))}
                            </div>
                        )}
                        {reviewsData && items.length < totalCount && (
                            <button
                                type="button"
                                className={style['reviews__load-more']}
                                onClick={handleLoadMore}
                                disabled={isFetching}
                                aria-busy={isFetching}
                            >
                                {isFetching ? 'Loading…' : `Load more (${items.length} of ${totalCount})`}
                            </button>
                        )}
                        {items.length >= REVIEWS_PAGE_SIZE && (
                            <button
                                type="button"
                                className={style['reviews__back-to-top']}
                                onClick={handleBackToTop}
                            >
                                <FaArrowUp />
                                <span>Back to top</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};
