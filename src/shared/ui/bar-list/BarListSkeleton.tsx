import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './bar-list.module.scss';

interface BarListSkeletonProps {
  rows?: number;
}

export const BarListSkeleton = ({ rows = 4 }: BarListSkeletonProps) => (
  <div className={style['bar-list']}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className={style['bar-list__row']}>
        <Skeleton height={16} width="60%" />
        <Skeleton height={8} borderRadius={99} />
      </div>
    ))}
  </div>
);
