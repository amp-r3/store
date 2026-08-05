import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import style from './donut-chart.module.scss';

interface DonutChartSkeletonProps {
    size?: number;
    legendRows?: number;
}

export const DonutChartSkeleton = ({ size = 180, legendRows = 3 }: DonutChartSkeletonProps) => (
    <div className={style['donut-chart']}>
        <Skeleton circle width={size} height={size} />
        <div className={style['donut-chart__legend']}>
            {Array.from({ length: legendRows }).map((_, index) => (
                <Skeleton key={index} height={16} />
            ))}
        </div>
    </div>
);
