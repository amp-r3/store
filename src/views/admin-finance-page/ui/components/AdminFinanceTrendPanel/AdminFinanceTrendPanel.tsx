import { useMemo } from 'react';
import { LuTrendingUp } from 'react-icons/lu';

import { useGetAdminFinanceSeriesQuery } from '@/entities/admin';
import {
  Alert,
  BarChart,
  BarChartSkeleton,
  EmptyState,
  PanelCard,
  type BarChartSeries,
} from '@/shared/ui';
import { formatDate, formatPriceCompact, getErrorMessage } from '@/shared/lib';
import { useMediaQuery } from '@/shared/lib/hooks';

interface AdminFinanceTrendPanelProps {
  days: number;
}

const SERIES: BarChartSeries[] = [
  { key: 'itemsSubtotal', label: 'Net to store', colorVar: '--chart-series-1' },
  { key: 'deliveryCost', label: 'Delivery', colorVar: '--chart-series-3' },
  { key: 'paymentFee', label: 'Fees', colorVar: '--chart-series-2' },
];

const CHART_HEIGHT_DESKTOP = 240;
const CHART_HEIGHT_MOBILE = 200;

export const AdminFinanceTrendPanel = ({ days }: AdminFinanceTrendPanelProps) => {
  const { data, isLoading, isFetching, error } = useGetAdminFinanceSeriesQuery(days);
  const isMobile = useMediaQuery('(max-width: 600px)');

  const points = useMemo(
    () =>
      (data ?? []).map((point) => ({
        label: formatDate(point.day, 'compact'),
        values: {
          itemsSubtotal: point.itemsSubtotal,
          deliveryCost: point.deliveryCost,
          paymentFee: point.paymentFee,
        },
      })),
    [data],
  );

  const hasData = points.some((point) => Object.values(point.values).some((value) => value > 0));

  return (
    <PanelCard title="Daily breakdown">
      {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {isLoading ? (
        <BarChartSkeleton height={isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP} />
      ) : !hasData ? (
        <EmptyState
          icon={<LuTrendingUp />}
          title="Nothing to break down yet"
          text={`No paid orders in the last ${days} days.`}
        />
      ) : (
        <BarChart
          points={points}
          series={SERIES}
          ariaLabel={`Daily revenue breakdown over the last ${days} days`}
          height={isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP}
          formatValue={formatPriceCompact}
          isStale={isFetching && !isLoading}
        />
      )}
    </PanelCard>
  );
};
