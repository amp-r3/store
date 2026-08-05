import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface BarChartSkeletonProps {
    height?: number;
}

export const BarChartSkeleton = ({ height = 220 }: BarChartSkeletonProps) => (
    <Skeleton height={height} borderRadius={12} />
);
