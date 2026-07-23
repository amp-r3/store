import Skeleton from 'react-loading-skeleton';
import style from './reviews-controls.module.scss';

export const ReviewsControlsSkeleton = () => {
    return (
        <div className={style['reviews-controls']} role="status">
            <span className="sr-only">Loading review controls…</span>
            <div className={style['reviews-controls__summary']} aria-hidden="true">
                <Skeleton width={160} height={18} />
            </div>
            <div className={style['reviews-controls__sort']} aria-hidden="true">
                <Skeleton width={120} height={28} borderRadius={6} />
            </div>
        </div>
    );
};
export default ReviewsControlsSkeleton;
