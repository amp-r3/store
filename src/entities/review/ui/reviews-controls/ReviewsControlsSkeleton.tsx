import Skeleton from 'react-loading-skeleton';
import style from './reviews-controls.module.scss';

export const ReviewsControlsSkeleton = () => {
    return (
        <div className={style['reviews-controls']}>
            <div className={style['reviews-controls__sort']}>
                <Skeleton width={120} height={28} borderRadius={6} />
            </div>
            <div className={style['reviews-controls__filters']}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        width={75}
                        height={28}
                        borderRadius={14}
                        style={{ marginRight: '8px' }}
                    />
                ))}
            </div>
        </div>
    );
};
export default ReviewsControlsSkeleton;
