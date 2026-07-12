import { FaComments } from 'react-icons/fa';
import { ReviewCardSkeleton } from '@/entities/review';
import { ReviewsStatsSkeleton } from '@/entities/review/ui/reviews-stats/ReviewsStatsSkeleton';
import { ReviewsControlsSkeleton } from '@/entities/review/ui/reviews-controls/ReviewsControlsSkeleton';
import style from './product-reviews.module.scss';

export const ProductReviewsSkeleton = () => {
    return (
        <section id="reviews" className={style['reviews']}>
            <div className={style['reviews__header']}>
                <h2 className={style['reviews__title']}>
                    <FaComments className={style['reviews__title-icon']} />
                    <span>Customer Feedback</span>
                </h2>
                <div className={style['reviews__count-badge']} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <div style={{ width: '80px', height: '24px', overflow: 'hidden', borderRadius: '12px' }}>
                        {/* A nice skeleton inside the same placeholder dimensions */}
                        <div style={{ background: 'var(--skeleton-base)', width: '100%', height: '100%' }} />
                    </div>
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