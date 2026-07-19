import Skeleton from 'react-loading-skeleton';

import style from './user-review-card.module.scss';

interface UserReviewCardSkeletonProps {
    count?: number;
}

export const UserReviewCardSkeleton = ({ count = 3 }: UserReviewCardSkeletonProps) => (
    <>
        {Array.from({ length: count }, (_, i) => (
            <article
                key={i}
                className={style['user-review-card']}
                style={{ pointerEvents: 'none' }}
                aria-hidden="true"
            >
                <div className={style['user-review-card__product']}>
                    <Skeleton width={56} height={56} borderRadius={12} />
                    <Skeleton width="55%" height={18} />
                </div>

                <div className={style['user-review-card__body']}>
                    <div className={style['user-review-card__summary']}>
                        <Skeleton width={86} height={14} />
                        <Skeleton width={100} height={12} />
                    </div>
                    <Skeleton count={2} height={12} />
                </div>

                <div className={style['user-review-card__footer']}>
                    <Skeleton width={96} height={44} borderRadius={999} />
                    <Skeleton width={110} height={44} borderRadius={999} />
                </div>
            </article>
        ))}
    </>
);
