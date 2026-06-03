import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './order-item.module.scss';

interface OrderItemSkeletonProps {
  count?: number;
}

export const OrderItemSkeleton: React.FC<OrderItemSkeletonProps> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <article className={style['order-item']} aria-hidden="true" key={i}>
        <div className={style['order-item__image-wrapper']}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
        </div>

        <div className={style['order-item__info']}>
          <Skeleton width="85%" height={16} borderRadius={4} />
          <Skeleton width="40%" height={14} borderRadius={999} />
        </div>

        <div className={style['order-item__price-block']}>
          <Skeleton width={60} height={12} borderRadius={4} />
          <Skeleton width={80} height={20} borderRadius={6} />
        </div>
      </article>
    ))}
  </>
);
