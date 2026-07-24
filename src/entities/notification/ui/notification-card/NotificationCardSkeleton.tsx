import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './notification-card.module.scss';

interface NotificationCardSkeletonProps {
    count?: number;
}

export const NotificationCardSkeleton: FC<NotificationCardSkeletonProps> = ({ count = 1 }) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <div key={index} className={style.notificationCard} style={{ pointerEvents: 'none' }}>
                    <div className={style.notificationCard__content}>
                        <Skeleton
                            width="60%"
                            height={16}
                            borderRadius={4}
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                        <Skeleton
                            width="90%"
                            height={13}
                            borderRadius={4}
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                        <Skeleton
                            width={80}
                            height={11}
                            borderRadius={4}
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                </div>
            ))}
        </>
    );
};
