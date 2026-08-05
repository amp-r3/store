import { useMemo, useState } from 'react';
import { LuWallet } from 'react-icons/lu';

import { useGetAdminRevenueSeriesQuery } from '@/entities/admin';
import { Alert, EmptyState, LineChart, LineChartSkeleton, PanelCard, SegmentedTabs, type SegmentedTabItem } from '@/shared/ui';
import { formatPrice, formatPriceCompact, getErrorMessage } from '@/shared/lib';
import { useMediaQuery } from '@/shared/lib/hooks';

import style from './admin-revenue-panel.module.scss';

type RevenueRange = '7' | '30' | '90';

const RANGE_ITEMS: SegmentedTabItem<RevenueRange>[] = [
    { id: '7', label: '7d' },
    { id: '30', label: '30d' },
    { id: '90', label: '90d' },
];

const CHART_HEIGHT_DESKTOP = 220;
const CHART_HEIGHT_MOBILE = 180;

export const AdminRevenuePanel = () => {
    const [range, setRange] = useState<RevenueRange>('30');
    const { data, isLoading, isFetching, error } = useGetAdminRevenueSeriesQuery(Number(range));
    const isMobile = useMediaQuery('(max-width: 600px)');

    // Plotting revenue only — orders_count rides along as tooltip/summary
    // context, never a second line: two measures of different scale on one
    // axis would invent a correlation that isn't in the data.
    const points = useMemo(() => (data ?? []).map((point) => ({
        label: new Date(point.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: point.revenue,
        tooltip: `${formatPrice(point.revenue)} · ${point.ordersCount} ${point.ordersCount === 1 ? 'order' : 'orders'}`,
    })), [data]);

    const totalRevenue = useMemo(() => points.reduce((sum, point) => sum + point.value, 0), [points]);
    const totalOrders = useMemo(() => (data ?? []).reduce((sum, point) => sum + point.ordersCount, 0), [data]);

    return (
        <PanelCard
            title="Revenue"
            action={
                <SegmentedTabs
                    items={RANGE_ITEMS}
                    value={range}
                    onChange={setRange}
                    idPrefix="revenue-range"
                    ariaLabel="Revenue period"
                    size="sm"
                />
            }
        >
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {isLoading ? (
                <LineChartSkeleton height={isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP} />
            ) : totalOrders === 0 ? (
                <EmptyState
                    icon={<LuWallet />}
                    title="No revenue yet"
                    text={`No paid orders in the last ${range} days.`}
                />
            ) : (
                <>
                    <div className={style['admin-revenue-panel__summary']}>
                        <span className={style['admin-revenue-panel__summary-value']}>{formatPrice(totalRevenue)}</span>
                        <span className={style['admin-revenue-panel__summary-meta']}>
                            {totalOrders} {totalOrders === 1 ? 'order' : 'orders'} in this period
                        </span>
                    </div>

                    <LineChart
                        points={points}
                        ariaLabel={`Daily revenue over the last ${range} days`}
                        height={isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP}
                        formatValue={formatPriceCompact}
                        isStale={isFetching && !isLoading}
                    />
                </>
            )}
        </PanelCard>
    );
};
