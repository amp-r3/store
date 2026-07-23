import Skeleton from 'react-loading-skeleton';
import style from './review-card.module.scss';

export const ReviewCardSkeleton = () => {
    return (
        <article className={style['review-card']} role="status">
            <span className="sr-only">Loading review…</span>
            <div className={style['review-card__header']} aria-hidden="true">
                <div className={style['review-card__user']}>
                    {/* Circle avatar skeleton */}
                    <div className={style['review-card__avatar']} style={{ background: 'none', boxShadow: 'none' }}>
                        <Skeleton circle width={44} height={44} />
                    </div>
                    <div className={style['review-card__author-info']}>
                        <div className={style['review-card__author-name']}>
                            <Skeleton width={110} height={16} />
                        </div>
                        <div className={style['review-card__badge']} style={{ color: 'var(--skeleton-base)' }}>
                            <Skeleton width={85} height={12} />
                        </div>
                    </div>
                </div>

                <div className={style['review-card__rating']}>
                    <Skeleton width={80} height={14} />
                </div>
            </div>

            <div className={style['review-card__meta']} aria-hidden="true">
                <Skeleton circle width={12} height={12} />
                <Skeleton width={130} height={12} style={{ marginLeft: '4px' }} />
            </div>

            <div className={style['review-card__comment']} aria-hidden="true">
                <Skeleton count={2} height={14} style={{ marginBottom: '6px' }} />
                <Skeleton width="60%" height={14} />
            </div>

            <div className={style['review-card__footer']} aria-hidden="true">
                <Skeleton width={90} height={26} borderRadius={13} />
            </div>
        </article>
    );
};
