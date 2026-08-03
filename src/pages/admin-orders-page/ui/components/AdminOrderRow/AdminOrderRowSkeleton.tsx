import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-order-row.module.scss';

interface AdminOrderRowSkeletonProps {
    count?: number;
}

export const AdminOrderRowSkeleton = ({ count = 1 }: AdminOrderRowSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-order-row']} style={{ pointerEvents: 'none' }}>
                    <div className={style['admin-order-row__cell']}>
                        <Skeleton width={70} height={16} />
                        <Skeleton width={90} height={12} />
                    </div>
                    <div className={style['admin-order-row__cell']}>
                        <Skeleton width={110} height={16} />
                        <Skeleton width={130} height={12} />
                    </div>
                    <div className={style['admin-order-row__cell']}>
                        <Skeleton width={60} height={16} />
                        <Skeleton width={50} height={12} />
                    </div>
                    <div className={style['admin-order-row__cell']}>
                        <Skeleton width={80} height={18} borderRadius={12} />
                    </div>
                    <div className={style['admin-order-row__cell']}>
                        <Skeleton width={120} height={28} borderRadius={16} />
                    </div>
                    <div className={style['admin-order-row__cell']}>
                        <Skeleton width={120} height={28} borderRadius={16} />
                    </div>
                </article>
            ))}
        </>
    );
};
