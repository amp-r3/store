import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-customer-row.module.scss';

interface AdminCustomerRowSkeletonProps {
    count?: number;
}

export const AdminCustomerRowSkeleton = ({ count = 1 }: AdminCustomerRowSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-customer-row']} style={{ pointerEvents: 'none' }}>
                    <div className={style['admin-customer-row__cell']}>
                        <Skeleton circle width={36} height={36} />
                        <Skeleton width={120} height={16} />
                    </div>
                    <div className={style['admin-customer-row__cell']}>
                        <Skeleton width={160} height={16} />
                    </div>
                    <div className={style['admin-customer-row__cell']}>
                        <Skeleton width={70} height={20} />
                    </div>
                    <div className={style['admin-customer-row__cell']}>
                        <Skeleton width={30} height={16} />
                    </div>
                    <div className={style['admin-customer-row__cell']}>
                        <Skeleton width={70} height={16} />
                    </div>
                    <div className={style['admin-customer-row__cell']}>
                        <Skeleton width={90} height={16} />
                    </div>
                    <div className={style['admin-customer-row__actions']}>
                        <Skeleton width={44} height={44} borderRadius={12} />
                    </div>
                </article>
            ))}
        </>
    );
};
