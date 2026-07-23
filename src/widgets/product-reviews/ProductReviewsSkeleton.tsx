import Skeleton from 'react-loading-skeleton';
import { FaComments } from 'react-icons/fa';
import { ReviewCardSkeleton, ReviewsStatsSkeleton, ReviewsControlsSkeleton } from '@/entities/review';
import style from './product-reviews.module.scss';

export const ProductReviewsSkeleton = () => {
    return (
        <section id="reviews" className={style['reviews']} role="status">
            <span className="sr-only">Loading reviews…</span>
            <div className={style['reviews__header']}>
                <h2 className={style['reviews__title']}>
                    <FaComments className={style['reviews__title-icon']} aria-hidden="true" />
                    <span>Customer Feedback</span>
                </h2>
                <div className={style['reviews__count-badge']} style={{ background: 'none', border: 'none', padding: 0 }} aria-hidden="true">
                    <Skeleton width={80} height={24} borderRadius={12} />
                </div>
            </div>

            <div className={style['reviews__layout']}>
                {/* Decomposed Left Panel: Statistics Skeleton */}
                <ReviewsStatsSkeleton />

                {/* Right Panel: Controls and Review Cards Skeletons */}
                <div className={style['reviews__list-panel']}>
                    <ReviewsControlsSkeleton />

                    <div className={style['reviews__list']}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <ReviewCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductReviewsSkeleton;