import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './order-item.module.scss';

interface OrderItemSkeletonProps {
  count?: number;
}

const OrderItemSkeletonRow: React.FC = () => (
  <div className={style.orderItem} aria-hidden="true">

    <div className={style.imageWrapper}>
      <Skeleton width="100%" height="100%" borderRadius={0} />
    </div>

    <div className={style.info}>
      <Skeleton width="72%" height={16} borderRadius={6} />
      <Skeleton width="48%" height={14} borderRadius={4} style={{ marginTop: 2 }} />
      <Skeleton width="56px" height={18} borderRadius={999} style={{ marginTop: 4 }} />
    </div>

    <div className={style.priceBlock}>
      <Skeleton width={64} height={12} borderRadius={4} />
      <Skeleton width={76} height={20} borderRadius={6} />
    </div>

  </div>
);

export const OrderItemSkeleton: React.FC<OrderItemSkeletonProps> = ({ count = 3 }) => (
  <SkeletonTheme
    baseColor="var(--skeleton-base)"
    highlightColor="var(--skeleton-highlight)"
  >
    {Array.from({ length: count }, (_, i) => (
      <OrderItemSkeletonRow key={i} />
    ))}
  </SkeletonTheme>
);