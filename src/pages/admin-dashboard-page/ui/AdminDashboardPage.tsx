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
import { Alert, SectionHeader } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import { AdminStatCard, AdminStatCardSkeleton } from './components';
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
                    <AdminStatCardSkeleton count={7} />
                ) : (
                    <>
                        <AdminStatCard label="Total orders" value={stats.ordersTotal} icon={LuClipboardList} />
                        <AdminStatCard label="Active orders" value={stats.ordersActive} icon={LuActivity} />
                        <AdminStatCard label="Awaiting payment" value={stats.ordersAwaitingPayment} icon={LuBanknote} />
                        <AdminStatCard label="Awaiting dispatch" value={stats.ordersAwaitingDispatch} icon={LuTruck} />
                        <AdminStatCard label="Revenue" value={formatPrice(stats.revenueTotal)} icon={LuWallet} />
                        <AdminStatCard label="Customers" value={stats.customersTotal} icon={LuUsers} />
                        <AdminStatCard label="Products" value={stats.productsTotal} icon={LuPackage} />
                    </>
                )}
            </div>
        </>
    );
};
