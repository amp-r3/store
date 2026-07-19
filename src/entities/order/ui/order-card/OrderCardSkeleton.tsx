import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './order-card.module.scss';

interface OrderCardSkeletonProps {
    count?: number;
}

export const OrderCardSkeleton: FC<OrderCardSkeletonProps> = ({ count = 1 }) => {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <article
                    key={index}
                    className={`${style.orderCard} ${style.skeletonCard}`}
                    style={{ cursor: 'default', pointerEvents: 'none' }}
                >
                    <div className={style.mainInfo}>
                        <div>
                            <Skeleton width={80} height={24} borderRadius={12} />
                        </div>
                        <div className={style.orderTotal}>
                            <Skeleton width={70} height={20} />
                        </div>
                    </div>

                    <div className={style.metaInfo}>
                        <span className={style.orderNumber}>
                            <Skeleton width={55} height={16} />
                        </span>
                        <span className={style.orderDate}>
                            <Skeleton width={90} height={14} />
                        </span>
                    </div>

                    <div className={style.thumbnails}>
                        <Skeleton width={44} height={44} borderRadius={8} />
                        <Skeleton width={44} height={44} borderRadius={8} />
                        <Skeleton width={44} height={44} borderRadius={8} />
                    </div>
                </article>
            ))}
        </>
    );
};