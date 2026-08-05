import { LuTruck } from 'react-icons/lu';

import { useGetAdminFinanceBreakdownQuery } from '@/entities/admin';
import { Alert, BarList, BarListSkeleton, EmptyState, PanelCard } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

interface AdminDeliveryPanelProps {
    days: number;
}

export const AdminDeliveryPanel = ({ days }: AdminDeliveryPanelProps) => {
    const { data, isLoading, error } = useGetAdminFinanceBreakdownQuery(days);
    const methods = data?.deliveryMethods ?? [];

    return (
        <PanelCard title="Delivery methods">
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {isLoading ? (
                <BarListSkeleton />
            ) : methods.length === 0 ? (
                <EmptyState
                    icon={<LuTruck />}
                    title="No paid orders yet"
                    text={`No paid orders in the last ${days} days.`}
                />
            ) : (
                <BarList
                    items={methods.map((method) => ({
                        key: method.code,
                        label: `${method.name} · ${method.ordersCount} ${method.ordersCount === 1 ? 'order' : 'orders'}`,
                        value: method.collected,
                        formattedValue: formatPrice(method.collected),
                        meta: method.freeCount > 0
                            ? `${method.freeCount} free · ${formatPrice(method.subsidy)} subsidized`
                            : 'No free shipping given',
                    }))}
                />
            )}
        </PanelCard>
    );
};
