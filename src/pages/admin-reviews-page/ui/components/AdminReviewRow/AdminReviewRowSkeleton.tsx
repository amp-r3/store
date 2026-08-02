import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-review-row.module.scss';

interface AdminReviewRowSkeletonProps {
    count?: number;
}

export const AdminReviewRowSkeleton = ({ count = 1 }: AdminReviewRowSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-review-row']} style={{ pointerEvents: 'none' }}>
                    <div className={style['admin-review-row__cell']}>
                        <Skeleton width={120} height={16} />
                    </div>
                    <div className={style['admin-review-row__cell']}>
                        <Skeleton width={80} height={16} />
                    </div>
                    <div className={style['admin-review-row__cell']}>
                        <Skeleton count={2} height={14} />
                    </div>
                    <div className={style['admin-review-row__cell']}>
                        <Skeleton width={100} height={16} />
                    </div>
                    <div className={style['admin-review-row__cell']}>
                        <Skeleton width={30} height={16} />
                    </div>
                    <div className={style['admin-review-row__cell']}>
                        <Skeleton width={36} height={36} borderRadius={8} />
                    </div>
                </article>
            ))}
        </>
    );
};
