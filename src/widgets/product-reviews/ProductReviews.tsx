import { useEffect, useRef, useState } from 'react';
import { FaComments, FaArrowUp } from 'react-icons/fa';

import { ReviewsStats, ReviewsStatsSkeleton, ReviewsControls } from '@/entities/review';
import { ReviewsSort } from '@/features/product-reviews-sort';
import style from './product-reviews.module.scss';
import ProductReviewsSkeleton from './ProductReviewsSkeleton';
import { ReviewCard, ReviewCardSkeleton } from '@/entities/review';
import { useGetReviewsQuery, useGetReviewStatsQuery } from "@/entities/review";
import type { ReviewSort, ReviewRatingStats, PaginatedReviews } from '@/entities/review';
import { REVIEWS_PAGE_SIZE } from '@/entities/review';
import { openReviewModal } from '@/features/order-review';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { selectUser } from '@/entities/session';
import { scrollToElement, getErrorMessage } from '@/shared/lib';

interface ProductReviewsProps {
    productId: number;
    // Server-fetched (default sort, unfiltered, page 1) — used as a fallback
    // for the first paint only, so crawlers and pre-hydration users see real
    // review content instead of a skeleton. Ignored once the RTK Query cache
    // has its own data, or once the user changes sort/filter/page.
    initialStats?: ReviewRatingStats;
    initialReviews?: PaginatedReviews;
}

export const ProductReviews = ({ productId, initialStats, initialReviews }: ProductReviewsProps) => {
    // Local rather than URL-synced: useSearchParams() forces this route to
    // bail out to client-side-only rendering during static generation for a
    // generateStaticParams route (see ProductPage.tsx's isImageOpen for the
    // same reasoning) — not worth losing SSR/ISR for shareable filter URLs.
    const [sort, setSort] = useState<ReviewSort>('newest');
    const [activeRating, setActiveRating] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const isDefaultView = sort === 'newest' && activeRating === null && page === 1;

    const {
        data: statsQueryData,
        isError: isStatsError,
        error: statsError,
        refetch: refetchStats,
    } = useGetReviewStatsQuery(productId);
    const stats = statsQueryData ?? (isDefaultView ? initialStats : undefined);

    const {
        data: reviewsQueryData,
        isLoading: isReviewsLoading,
        isFetching,
        isError: isReviewsError,
        error: reviewsError,
        refetch: refetchReviews,
    } = useGetReviewsQuery({ productId, page: 1, limit: page * REVIEWS_PAGE_SIZE, sort, rating: activeRating });
    // getReviews has a custom `merge` (cumulative pagination), which makes
    // RTK Query populate `data` with an empty placeholder before the query
    // actually resolves — checking isLoading (true until the first real
    // resolution) rather than just `data`'s truthiness avoids that placeholder
    // shadowing the real server-fetched fallback on first paint.
    const reviewsData = (!isReviewsLoading && reviewsQueryData) ? reviewsQueryData : (isDefaultView ? initialReviews : undefined);

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
        setSort(nextSort);
        setPage(1);
    };

    const handleRatingChange = (nextRating: number | null) => {
        setActiveRating(nextRating);
        setPage(1);
    };

    const handleLoadMore = () => {
        prevItemsLengthRef.current = reviewsData?.items.length ?? 0;
        loadMoreRequestedRef.current = true;
        setPage((p) => p + 1);
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
                    <FaComments className={style['reviews__title-icon']} aria-hidden="true" />
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
                                {/* reviewsQueryData: isFetching is always true
                                    server-side (the query never actually
                                    resolves during SSR/build) — gating on it
                                    too keeps this trailing skeleton from
                                    baking into the static/ISR snapshot while
                                    the real fallback content is already shown
                                    above. */}
                                {reviewsQueryData && isFetching && items.length < totalCount && Array.from({
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
                                <FaArrowUp aria-hidden="true" />
                                <span>Back to top</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};
