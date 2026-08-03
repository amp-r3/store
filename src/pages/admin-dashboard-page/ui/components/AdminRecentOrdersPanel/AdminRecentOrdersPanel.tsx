import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router';
import { LuClipboardList } from 'react-icons/lu';

import { useGetAllOrdersQuery } from '@/entities/admin';
import { ORDER_STATUS_MAP } from '@/entities/order';
import { Alert, EmptyState } from '@/shared/ui';
import { formatPrice, formatDate, getErrorMessage } from '@/shared/lib';

import { AdminPanelCard } from '../AdminPanelCard/AdminPanelCard';
import style from './admin-recent-orders-panel.module.scss';

const RECENT_ORDERS_LIMIT = 5;

export const AdminRecentOrdersPanel = () => {
    const { data, isLoading, error } = useGetAllOrdersQuery({ page: 1, limit: RECENT_ORDERS_LIMIT, status: 'all' });
    const orders = data?.items ?? [];

    return (
        <AdminPanelCard title="Recent orders" to="/admin/orders">
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {isLoading ? (
                <div className={style['admin-recent-orders-panel__list']}>
                    {Array.from({ length: RECENT_ORDERS_LIMIT }).map((_, index) => (
                        <div key={index} className={style['admin-recent-orders-panel__row']}>
                            <div className={style['admin-recent-orders-panel__main']}>
                                <Skeleton width={90} height={16} />
                                <Skeleton width={50} height={13} />
                            </div>
                            <div className={style['admin-recent-orders-panel__meta']}>
                                <Skeleton width={60} height={16} />
                                <Skeleton width={70} height={20} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState icon={<LuClipboardList />} title="No orders yet" text="Orders placed by customers will show up here." />
            ) : (
                <div className={style['admin-recent-orders-panel__list']}>
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            to={`/admin/orders?order=${order.id}`}
                            className={style['admin-recent-orders-panel__row']}
                        >
                            <span className={style['admin-recent-orders-panel__main']}>
                                <span className={style['admin-recent-orders-panel__number']}>#{order.orderId}</span>
                                <span className={style['admin-recent-orders-panel__date']}>{formatDate(order.createdAt, 'compact')}</span>
                            </span>
                            <span className={style['admin-recent-orders-panel__meta']}>
                                <span className={style['admin-recent-orders-panel__total']}>{formatPrice(order.totalAmount)}</span>
                                <span
                                    className={`${style['admin-recent-orders-panel__status']} ${style[`admin-recent-orders-panel__status--${order.status}`]}`}
                                    data-status={order.status}
                                >
                                    {ORDER_STATUS_MAP[order.status]?.label ?? order.status}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </AdminPanelCard>
    );
};
