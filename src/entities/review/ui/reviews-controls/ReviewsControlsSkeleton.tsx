import Skeleton from 'react-loading-skeleton';
import style from './reviews-controls.module.scss';

export const ReviewsControlsSkeleton = () => {
    return (
        <div className={style['reviews-controls']}>
            <div className={style['reviews-controls__summary']}>
                <Skeleton width={160} height={18} />
            </div>
            <div className={style['reviews-controls__sort']}>
                <Skeleton width={120} height={28} borderRadius={6} />
            </div>
        </div>
    );
};
export default ReviewsControlsSkeleton;
