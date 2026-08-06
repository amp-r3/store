import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-category-row.module.scss';

interface AdminCategoryRowSkeletonProps {
    count?: number;
}

export const AdminCategoryRowSkeleton = ({ count = 1 }: AdminCategoryRowSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-category-row']} style={{ pointerEvents: 'none' }}>
                    <div className={style['admin-category-row__cell']}>
                        <span className={style['admin-category-row__cell-label']}>Name</span>
                        <Skeleton width={120} height={16} />
                    </div>
                    <div className={style['admin-category-row__cell']}>
                        <span className={style['admin-category-row__cell-label']}>Slug</span>
                        <Skeleton width={100} height={14} />
                    </div>
                    <div className={style['admin-category-row__cell']}>
                        <span className={style['admin-category-row__cell-label']}>Products</span>
                        <Skeleton width={30} height={14} />
                    </div>
                    <div className={style['admin-category-row__actions']}>
                        <Skeleton width={44} height={44} borderRadius={12} />
                        <Skeleton width={44} height={44} borderRadius={12} />
                    </div>
                </article>
            ))}
        </>
    );
};
