import { LuCreditCard } from 'react-icons/lu';

import { useGetAdminFinanceBreakdownQuery } from '@/entities/admin';
import { Alert, BarList, BarListSkeleton, EmptyState, PanelCard } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

interface AdminPaymentMethodsPanelProps {
  days: number;
}

const formatFeeRate = (feePercentage: number, feeFixed: number) => {
  if (feePercentage === 0 && feeFixed === 0) return 'No fee';
  if (feeFixed === 0) return `${feePercentage}%`;
  if (feePercentage === 0) return formatPrice(feeFixed);
  return `${feePercentage}% + ${formatPrice(feeFixed)}`;
};

export const AdminPaymentMethodsPanel = ({ days }: AdminPaymentMethodsPanelProps) => {
  const { data, isLoading, error } = useGetAdminFinanceBreakdownQuery(days);
  const methods = data?.paymentMethods ?? [];

  return (
    <PanelCard title="Payment methods">
      {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {isLoading ? (
        <BarListSkeleton />
      ) : methods.length === 0 ? (
        <EmptyState
          icon={<LuCreditCard />}
          title="No paid orders yet"
          text={`No paid orders in the last ${days} days.`}
        />
      ) : (
        <BarList
          items={methods.map((method) => ({
            key: method.code,
            label: `${method.name} · ${method.ordersCount} ${method.ordersCount === 1 ? 'order' : 'orders'}`,
            value: method.gross,
            formattedValue: formatPrice(method.gross),
            meta: `${formatFeeRate(method.feePercentage, method.feeFixed)} fee · ${formatPrice(method.fees)} total`,
          }))}
        />
      )}
    </PanelCard>
  );
};
