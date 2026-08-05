import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-low-stock-row.module.scss';

interface AdminLowStockRowSkeletonProps {
    count?: number;
}

export const AdminLowStockRowSkeleton = ({ count = 1 }: AdminLowStockRowSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-low-stock-row']} style={{ pointerEvents: 'none' }}>
                    <div className={style['admin-low-stock-row__cell']}>
                        <span className={style['admin-low-stock-row__cell-label']}>Product</span>
                        <Skeleton width={44} height={44} borderRadius={8} />
                        <Skeleton width={140} height={16} />
                    </div>
                    <div className={style['admin-low-stock-row__cell']}>
                        <span className={style['admin-low-stock-row__cell-label']}>Size</span>
                        <Skeleton width={40} height={16} />
                    </div>
                    <div className={style['admin-low-stock-row__cell']}>
                        <span className={style['admin-low-stock-row__cell-label']}>Stock</span>
                        <Skeleton width={80} height={28} />
                    </div>
                </article>
            ))}
        </>
    );
};
