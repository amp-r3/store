import { LuWallet, LuPackage, LuLandmark, LuUndo2 } from 'react-icons/lu';

import { useGetAdminFinanceSummaryQuery } from '@/entities/admin';
import { Alert, StatTile, StatTileSkeleton } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import style from './admin-finance-kpi.module.scss';

interface AdminFinanceKpiProps {
  days: number;
}

export const AdminFinanceKpi = ({ days }: AdminFinanceKpiProps) => {
  const { data: summary, isLoading, error } = useGetAdminFinanceSummaryQuery(days);

  if (error) {
    return <Alert variant="error">{getErrorMessage(error)}</Alert>;
  }

  return (
    <div className={style['admin-finance-kpi']}>
      {isLoading || !summary ? (
        <StatTileSkeleton count={4} />
      ) : (
        <>
          <StatTile
            icon={<LuWallet />}
            label="Gross collected"
            value={formatPrice(summary.grossCollected)}
          />
          <StatTile
            icon={<LuPackage />}
            label="Net to store"
            value={formatPrice(summary.itemsSubtotal)}
          />
          <StatTile
            icon={<LuLandmark />}
            label="Payment fees"
            value={formatPrice(summary.paymentFees)}
          />
          <StatTile
            icon={<LuUndo2 />}
            label="Refunded"
            value={formatPrice(summary.refundedAmount)}
          />
        </>
      )}
    </div>
  );
};
