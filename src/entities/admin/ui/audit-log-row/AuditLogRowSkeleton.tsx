import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './audit-log-row.module.scss';

interface AuditLogRowSkeletonProps {
    count?: number;
}

export const AuditLogRowSkeleton = ({ count = 1 }: AuditLogRowSkeletonProps) => (
    <>
        {Array.from({ length: count }).map((_, index) => (
            <article key={index} className={style['audit-log-row']} style={{ pointerEvents: 'none' }}>
                <div className={style['audit-log-row__header']}>
                    <Skeleton width={100} height={16} />
                    <Skeleton width={160} height={16} />
                    <Skeleton width={80} height={20} />
                    <Skeleton width={120} height={14} />
                </div>
                <Skeleton height={16} />
            </article>
        ))}
    </>
);
