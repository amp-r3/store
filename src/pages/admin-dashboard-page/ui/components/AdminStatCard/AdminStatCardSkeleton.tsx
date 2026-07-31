import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './admin-stat-card.module.scss';

interface AdminStatCardSkeletonProps {
    count?: number;
}

export const AdminStatCardSkeleton = ({ count = 1 }: AdminStatCardSkeletonProps) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article key={index} className={style['admin-stat-card']} style={{ pointerEvents: 'none' }}>
                    <Skeleton circle width={44} height={44} />
                    <div className={style['admin-stat-card__body']}>
                        <Skeleton width={90} height={14} />
                        <Skeleton width={60} height={22} />
                    </div>
                </article>
            ))}
        </>
    );
};
