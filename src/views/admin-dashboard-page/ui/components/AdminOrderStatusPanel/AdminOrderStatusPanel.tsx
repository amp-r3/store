import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';

import { useGetAdminOrdersByStatusQuery } from '@/entities/admin';
import { ORDER_STATUS_MAP, ORDER_STATUS_OPTIONS } from '@/entities/order';
import { Alert, PanelCard } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';

import style from './admin-order-status-panel.module.scss';

export const AdminOrderStatusPanel = () => {
    const { data, isLoading, error } = useGetAdminOrdersByStatusQuery();

    // jsonb_object_agg doesn't guarantee key order — always iterate the
    // fixed, known status list rather than Object.keys(data).
    const counts = ORDER_STATUS_OPTIONS.map((status) => ({ status, count: data?.[status] ?? 0 }));
    const maxCount = Math.max(...counts.map((entry) => entry.count), 1);

    return (
        <PanelCard title="Orders by status" to="/admin/orders">
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            <div className={style['admin-order-status-panel__list']}>
                {isLoading ? (
                    Array.from({ length: ORDER_STATUS_OPTIONS.length }).map((_, index) => (
                        <Skeleton key={index} height={28} borderRadius={6} />
                    ))
                ) : (
                    counts.map(({ status, count }) => (
                        <Link
                            key={status}
                            href={`/admin/orders?status=${status}`}
                            className={style['admin-order-status-panel__row']}
                        >
                            <span className={style['admin-order-status-panel__label']}>
                                {ORDER_STATUS_MAP[status]?.label ?? status}
                            </span>
                            <span className={style['admin-order-status-panel__track']}>
                                <span
                                    className={style['admin-order-status-panel__bar']}
                                    data-status={status}
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                            </span>
                            <span className={style['admin-order-status-panel__count']}>{count}</span>
                        </Link>
                    ))
                )}
            </div>
        </PanelCard>
    );
};
