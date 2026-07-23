import Skeleton from 'react-loading-skeleton';
import style from './reviews-stats.module.scss';

export const ReviewsStatsSkeleton = () => {
    return (
        <div className={style['reviews-stats']} role="status">
            <span className="sr-only">Loading rating summary…</span>
            <div className={style['reviews-stats__average-card']} aria-hidden="true">
                <Skeleton width={70} height={56} style={{ marginBottom: '8px' }} />
                <Skeleton width={110} height={20} style={{ marginBottom: '4px' }} />
                <Skeleton width={140} height={14} />
            </div>

            <div className={style['reviews-stats__distribution']} aria-hidden="true">
                <Skeleton width={110} height={12} style={{ marginBottom: '4px' }} />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`${style['reviews-stats__dist-row']} ${style['reviews-stats__dist-row--skeleton']}`}>
                        <span className={style['reviews-stats__dist-label']}>
                            <Skeleton width={24} height={16} />
                        </span>
                        <div className={style['reviews-stats__dist-bar-wrap']}>
                            <Skeleton width="100%" height={8} borderRadius={4} />
                        </div>
                        <span className={style['reviews-stats__dist-value']}>
                            <Skeleton width={32} height={16} />
                        </span>
                        <span className={style['reviews-stats__dist-count']}>
                            <Skeleton width={30} height={16} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ReviewsStatsSkeleton;
