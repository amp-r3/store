import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './order-progress.module.scss';

export const OrderProgressSkeleton: FC = () => (
  <div className={style['progress']} aria-hidden="true">
    <div className={style['progress__bar']}>
      <Skeleton
        width={140}
        height={16}
        borderRadius={999}
        baseColor="var(--skeleton-base)"
        highlightColor="var(--skeleton-highlight)"
      />
    </div>
  </div>
);
