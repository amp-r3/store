import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-product-row.module.scss';

interface AdminProductRowSkeletonProps {
    count?: number;
}

export const AdminProductRowSkeleton = ({ count = 1 }: AdminProductRowSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-product-row']} style={{ pointerEvents: 'none' }}>
                    <div className={style['admin-product-row__cell']}>
                        <span className={style['admin-product-row__cell-label']}>Product</span>
                        <Skeleton width={44} height={44} borderRadius={8} />
                        <Skeleton width={140} height={16} />
                    </div>
                    <div className={style['admin-product-row__cell']}>
                        <span className={style['admin-product-row__cell-label']}>SKU</span>
                        <Skeleton width={70} height={16} />
                    </div>
                    <div className={style['admin-product-row__cell']}>
                        <span className={style['admin-product-row__cell-label']}>Category</span>
                        <Skeleton width={80} height={16} />
                    </div>
                    <div className={style['admin-product-row__cell']}>
                        <span className={style['admin-product-row__cell-label']}>Price</span>
                        <Skeleton width={60} height={16} />
                    </div>
                    <div className={style['admin-product-row__cell']}>
                        <span className={style['admin-product-row__cell-label']}>Rating</span>
                        <Skeleton width={50} height={16} />
                    </div>
                    <div className={style['admin-product-row__actions']}>
                        <Skeleton width={44} height={44} borderRadius={12} />
                    </div>
                </article>
            ))}
        </>
    );
};
