import { LuWallet } from 'react-icons/lu';

import { useGetAdminFinanceSummaryQuery } from '@/entities/admin';
import { Alert, DonutChart, DonutChartSkeleton, EmptyState, PanelCard } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import style from './admin-money-flow-panel.module.scss';

interface AdminMoneyFlowPanelProps {
  days: number;
}

export const AdminMoneyFlowPanel = ({ days }: AdminMoneyFlowPanelProps) => {
  const { data: summary, isLoading, error } = useGetAdminFinanceSummaryQuery(days);

  return (
    <PanelCard title="Where the money went">
      {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {isLoading || !summary ? (
        <DonutChartSkeleton />
      ) : summary.paidOrders === 0 ? (
        <EmptyState
          icon={<LuWallet />}
          title="No revenue yet"
          text={`No paid orders in the last ${days} days.`}
        />
      ) : (
        <>
          <DonutChart
            ariaLabel="Breakdown of gross revenue collected"
            centerValue={formatPrice(summary.grossCollected)}
            centerLabel="Gross collected"
            formatValue={formatPrice}
            segments={[
              {
                key: 'net',
                label: 'Net to store',
                value: summary.itemsSubtotal,
                colorVar: '--chart-series-1',
              },
              {
                key: 'delivery',
                label: 'Delivery collected',
                value: summary.deliveryCollected,
                colorVar: '--chart-series-3',
              },
              {
                key: 'fees',
                label: 'Payment fees',
                value: summary.paymentFees,
                colorVar: '--chart-series-2',
              },
            ]}
          />

          {/* Context, not part of the flow above — neither is money the
                        store collected, so they'd distort a chart built on
                        gross_collected. discounts_given is what a full-price sale
                        would have added to items_subtotal; shipping_subsidy is
                        the free-shipping gap between the delivery method's list
                        price and what the order actually paid. */}
          <dl className={style['admin-money-flow-panel__context']}>
            <div className={style['admin-money-flow-panel__context-row']}>
              <dt>Discounts given</dt>
              <dd>{formatPrice(summary.discountsGiven)}</dd>
            </div>
            <div className={style['admin-money-flow-panel__context-row']}>
              <dt>Shipping subsidy</dt>
              <dd>{formatPrice(summary.shippingSubsidy)}</dd>
            </div>
            <div className={style['admin-money-flow-panel__context-row']}>
              <dt>Cancelled / returned</dt>
              <dd>{formatPrice(summary.cancelledAmount)}</dd>
            </div>
            <div className={style['admin-money-flow-panel__context-row']}>
              <dt>Avg. order value</dt>
              <dd>{formatPrice(summary.avgOrderValue)}</dd>
            </div>
          </dl>
        </>
      )}
    </PanelCard>
  );
};
