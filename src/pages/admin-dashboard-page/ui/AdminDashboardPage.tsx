import {
    LuClipboardList,
    LuActivity,
    LuBanknote,
    LuTruck,
    LuWallet,
    LuUsers,
    LuPackage,
} from 'react-icons/lu';

import { useGetAdminDashboardStatsQuery } from '@/entities/admin';
import { Alert, SectionHeader, StatTile, StatTileSkeleton } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import style from './admin-dashboard-page.module.scss';

export const AdminDashboardPage = () => {
    const { data: stats, isLoading, error } = useGetAdminDashboardStatsQuery();

    return (
        <>
            <SectionHeader
                title="Dashboard"
                subtitle="Everything happening in the store right now"
            />

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            <div className={style['admin-dashboard-page__grid']}>
                {isLoading || !stats ? (
                    <StatTileSkeleton count={7} />
                ) : (
                    <>
                        <StatTile label="Total orders" value={stats.ordersTotal} icon={<LuClipboardList />} />
                        <StatTile label="Active orders" value={stats.ordersActive} icon={<LuActivity />} />
                        <StatTile label="Awaiting payment" value={stats.ordersAwaitingPayment} icon={<LuBanknote />} />
                        <StatTile label="Awaiting dispatch" value={stats.ordersAwaitingDispatch} icon={<LuTruck />} />
                        <StatTile label="Revenue" value={formatPrice(stats.revenueTotal)} icon={<LuWallet />} />
                        <StatTile label="Customers" value={stats.customersTotal} icon={<LuUsers />} />
                        <StatTile label="Products" value={stats.productsTotal} icon={<LuPackage />} />
                    </>
                )}
            </div>
        </>
    );
};
