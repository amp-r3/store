import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router';
import { LuShoppingBag, LuWallet, LuCalendarClock, LuCalendarCheck, LuPackageOpen, LuScrollText } from 'react-icons/lu';

import { AdminCustomer, useGetAllOrdersQuery, useGetAdminAuditLogQuery, AuditLogList } from '@/entities/admin';
import { ORDER_STATUS_MAP } from '@/entities/order';
import { formatPrice, formatDate } from '@/shared/lib';
import { EmptyState, StatTile } from '@/shared/ui';

import style from './admin-customer-details-body.module.scss';

interface AdminCustomerDetailsBodyProps {
    customer: AdminCustomer;
}

const RECENT_ORDERS_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 5;

const formatNullableDate = (dateStr: string | null) => (dateStr ? formatDate(dateStr, 'medium') : '—');

export const AdminCustomerDetailsBody: FC<AdminCustomerDetailsBodyProps> = ({ customer }) => {
    const { data, isLoading } = useGetAllOrdersQuery({
        page: 1,
        limit: RECENT_ORDERS_LIMIT,
        status: 'all',
        userId: customer.id,
    });

    const orders = data?.items ?? [];

    const isAdmin = customer.role === 'admin';
    // Only admins ever have audit-log rows tied to their id as actor — skip
    // the request entirely for regular customers rather than firing a query
    // that would always come back empty.
    const { data: auditData, isLoading: isAuditLoading } = useGetAdminAuditLogQuery(
        { page: 1, limit: RECENT_ACTIVITY_LIMIT, actorId: customer.id },
        { skip: !isAdmin }
    );
    const auditEntries = auditData?.items ?? [];

    const tiles = [
        { key: 'orders', icon: <LuShoppingBag />, value: customer.ordersCount, label: 'Orders placed' },
        { key: 'spent', icon: <LuWallet />, value: formatPrice(customer.totalSpent), label: 'Total spent' },
        { key: 'last-order', icon: <LuCalendarClock />, value: formatNullableDate(customer.lastOrderAt), label: 'Last order' },
        { key: 'registered', icon: <LuCalendarCheck />, value: formatNullableDate(customer.registeredAt), label: 'Registered' },
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
                                <div className={style['body__order-main']}>
                                    <Skeleton width={90} height={16} />
                                    <Skeleton width={50} height={13} />
                                </div>
                                <div className={style['body__order-meta']}>
                                    <Skeleton width={60} height={16} />
                                    <Skeleton width={70} height={20} />
                                </div>
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
                                <span className={style['body__order-main']}>
                                    <span className={style['body__order-number']}>#{order.orderId}</span>
                                    <span className={style['body__order-date']}>{formatDate(order.createdAt, 'compact')}</span>
                                </span>
                                <span className={style['body__order-meta']}>
                                    <span className={style['body__order-total']}>{formatPrice(order.totalAmount)}</span>
                                    <span
                                        className={`${style['body__order-status']} ${style[`body__order-status--${order.status}`]}`}
                                        data-status={order.status}
                                    >
                                        {ORDER_STATUS_MAP[order.status]?.label ?? order.status}
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className={style['body__activity-section']}>
                    <h3 className={style['body__section-title']}>Admin activity</h3>

                    {isAuditLoading ? (
                        <AuditLogList entries={[]} isLoading limit={RECENT_ACTIVITY_LIMIT} compact />
                    ) : auditEntries.length === 0 ? (
                        <EmptyState
                            icon={<LuScrollText />}
                            title="No activity yet"
                            text="Actions this admin takes will show up here."
                        />
                    ) : (
                        <>
                            <AuditLogList entries={auditEntries} isLoading={false} limit={RECENT_ACTIVITY_LIMIT} compact />
                            <Link to={`/admin/audit?actor=${customer.id}`} className={style['body__activity-link']}>
                                View all activity
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
