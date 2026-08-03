import { LuWallet, LuActivity, LuUsers, LuPackage } from 'react-icons/lu';

import { useGetAdminDashboardStatsQuery } from '@/entities/admin';
import { Alert, StatTile, StatTileSkeleton } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import style from './admin-dashboard-kpi.module.scss';

export const AdminDashboardKpi = () => {
    const { data: stats, isLoading, error } = useGetAdminDashboardStatsQuery();

    if (error) {
        return <Alert variant="error">{getErrorMessage(error)}</Alert>;
    }

    return (
        <div className={style['admin-dashboard-kpi']}>
            {isLoading || !stats ? (
                <StatTileSkeleton count={4} />
            ) : (
                <>
                    <StatTile icon={<LuWallet />} label="Revenue" value={formatPrice(stats.revenueTotal)} />
                    <StatTile icon={<LuActivity />} label="Active orders" value={stats.ordersActive} to="/admin/orders" />
                    <StatTile icon={<LuUsers />} label="Customers" value={stats.customersTotal} to="/admin/customers" />
                    <StatTile icon={<LuPackage />} label="Products" value={stats.productsTotal} to="/admin/products" />
                </>
            )}
        </div>
    );
};
