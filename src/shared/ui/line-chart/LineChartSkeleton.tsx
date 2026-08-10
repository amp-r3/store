import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface LineChartSkeletonProps {
  height?: number;
}

export const LineChartSkeleton = ({ height = 200 }: LineChartSkeletonProps) => (
  <Skeleton height={height} borderRadius={12} />
);
