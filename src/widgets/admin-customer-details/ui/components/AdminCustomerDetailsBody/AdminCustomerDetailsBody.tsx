import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router';
import { LuShoppingBag, LuWallet, LuCalendarClock, LuCalendarCheck, LuPackageOpen } from 'react-icons/lu';

import { AdminCustomer, useGetAllOrdersQuery } from '@/entities/admin';
import { ORDER_STATUS_MAP } from '@/entities/order';
import { formatPrice } from '@/shared/lib';
import { EmptyState, StatTile } from '@/shared/ui';

import style from './admin-customer-details-body.module.scss';

interface AdminCustomerDetailsBodyProps {
    customer: AdminCustomer;
}

const RECENT_ORDERS_LIMIT = 5;

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const AdminCustomerDetailsBody: FC<AdminCustomerDetailsBodyProps> = ({ customer }) => {
    const { data, isLoading } = useGetAllOrdersQuery({
        page: 1,
        limit: RECENT_ORDERS_LIMIT,
        status: 'all',
        userId: customer.id,
    });

    const orders = data?.items ?? [];

    const tiles = [
        { key: 'orders', icon: <LuShoppingBag />, value: customer.ordersCount, label: 'Orders placed' },
        { key: 'spent', icon: <LuWallet />, value: formatPrice(customer.totalSpent), label: 'Total spent' },
        { key: 'last-order', icon: <LuCalendarClock />, value: formatDate(customer.lastOrderAt), label: 'Last order' },
        { key: 'registered', icon: <LuCalendarCheck />, value: formatDate(customer.registeredAt), label: 'Registered' },
    ];

    return (
        <div className={style['body']}>
            <div className={style['body__tiles']}>
                {tiles.map((tile) => (
                    <StatTile
                        key={tile.key}
                        icon={tile.icon}
                        label={tile.label}
                        value={tile.value}
                        size="sm"
                        layout="column"
                    />
                ))}
            </div>

            <div className={style['body__orders-section']}>
                <h3 className={style['body__section-title']}>Recent orders</h3>

                {isLoading ? (
                    <div className={style['body__orders-list']}>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className={style['body__order-row']}>
                                <Skeleton width={90} height={16} />
                                <Skeleton width={70} height={16} />
                                <Skeleton width={60} height={20} />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <EmptyState
                        icon={<LuPackageOpen />}
                        title="No orders yet"
                        text="This customer hasn't placed any orders."
                    />
                ) : (
                    <div className={style['body__orders-list']}>
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                to={`/admin/orders?order=${order.id}`}
                                className={style['body__order-row']}
                            >
                                <span className={style['body__order-number']}>#{order.orderId}</span>
                                <span className={style['body__order-date']}>
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className={style['body__order-total']}>{formatPrice(order.totalAmount)}</span>
                                <span
                                    className={`${style['body__order-status']} ${style[`body__order-status--${order.status}`]}`}
                                    data-status={order.status}
                                >
                                    {ORDER_STATUS_MAP[order.status]?.label ?? order.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
