import { SectionHeader } from '@/shared/ui';

import {
    AdminDashboardKpi,
    AdminRevenuePanel,
    AdminTopProductsPanel,
    AdminOrderStatusPanel,
    AdminLowStockPanel,
    AdminRecentOrdersPanel,
} from './components';
import style from './admin-dashboard-page.module.scss';

export const AdminDashboardPage = () => {
    return (
        <>
            <SectionHeader
                title="Dashboard"
                subtitle="Everything happening in the store right now"
            />

            <AdminDashboardKpi />

            {/* Every panel below owns its own query, skeleton and error state —
                a slow or failed RPC never blocks the rest of the dashboard. */}
            <div className={style['admin-dashboard-page__grid']}>
                <div className={style['admin-dashboard-page__span-2']}>
                    <AdminRevenuePanel />
                </div>
                <AdminTopProductsPanel />
                <AdminOrderStatusPanel />
                <AdminLowStockPanel />
                <AdminRecentOrdersPanel />
            </div>
        </>
    );
};
