import Skeleton from 'react-loading-skeleton';

import style from './pending-review-card.module.scss';

interface PendingReviewCardSkeletonProps {
    count?: number;
}

export const PendingReviewCardSkeleton = ({ count = 3 }: PendingReviewCardSkeletonProps) => (
    <>
        {Array.from({ length: count }, (_, i) => (
            <article
                key={i}
                className={style['pending-card']}
                style={{ pointerEvents: 'none' }}
                aria-hidden="true"
            >
                <div className={style['pending-card__product']}>
                    <Skeleton width={56} height={56} borderRadius={12} />
                    <div className={style['pending-card__info']}>
                        <Skeleton width={180} height={18} />
                        <Skeleton width={120} height={12} />
                    </div>
                </div>

                <div className={style['pending-card__cta']}>
                    <Skeleton width={140} height={12} />
                    {/* 44x44 to match the real touch targets — no layout shift once the stars mount. */}
                    <div className={style['pending-card__stars']}>
                        {Array.from({ length: 5 }, (_, star) => (
                            <Skeleton key={star} width={44} height={44} circle />
                        ))}
                    </div>
                </div>
            </article>
        ))}
    </>
);
