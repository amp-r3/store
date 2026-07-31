import { memo } from 'react';

import {
    Order,
    PaymentStatus,
    DeliveryStatus,
    PAYMENT_STATUS_OPTIONS,
    DELIVERY_STATUS_OPTIONS,
    PAYMENT_STATUS_MAP,
    DELIVERY_STATUS_MAP,
    ORDER_STATUS_MAP,
} from '@/entities/order';
import { useUpdateOrderStatusMutation } from '@/entities/admin';
import { formatPrice } from '@/shared/lib';

import { AdminOrderStatusSelect } from '../AdminOrderStatusSelect/AdminOrderStatusSelect';
import style from './admin-order-row.module.scss';

interface AdminOrderRowProps {
    order: Order;
    formatOrderDate: (date: string) => string;
}

export const AdminOrderRow = memo(({ order, formatOrderDate }: AdminOrderRowProps) => {
    const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
    const { firstName, lastName, email } = order.shippingAddress;
    const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <article role="listitem" className={style['admin-order-row']}>
            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Order</span>
                <span className={style['admin-order-row__order-number']}>#{order.orderId}</span>
                <span className={style['admin-order-row__date']}>{formatOrderDate(order.createdAt)}</span>
            </div>

            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Customer</span>
                <span className={style['admin-order-row__customer-name']}>{firstName} {lastName}</span>
                <span className={style['admin-order-row__customer-email']}>{email}</span>
            </div>

            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Items</span>
                {itemCount}
            </div>

            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Total</span>
                <span className={style['admin-order-row__total']}>{formatPrice(order.totalAmount)}</span>
            </div>

            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Order status</span>
                <span
                    className={`${style['admin-order-row__status-badge']} ${style[`admin-order-row__status-badge--${order.status}`]}`}
                    data-status={order.status}
                >
                    {ORDER_STATUS_MAP[order.status]?.label ?? order.status}
                </span>
            </div>

            <div className={style['admin-order-row__cell']}>
                <AdminOrderStatusSelect<PaymentStatus>
                    label="Payment status"
                    value={order.paymentStatus}
                    options={PAYMENT_STATUS_OPTIONS}
                    statusMap={PAYMENT_STATUS_MAP}
                    disabled={isLoading}
                    onChange={(paymentStatus) => updateOrderStatus({ orderId: order.id, paymentStatus })}
                />
            </div>

            <div className={style['admin-order-row__cell']}>
                <AdminOrderStatusSelect<DeliveryStatus>
                    label="Delivery status"
                    value={order.deliveryStatus}
                    options={DELIVERY_STATUS_OPTIONS}
                    statusMap={DELIVERY_STATUS_MAP}
                    disabled={isLoading}
                    onChange={(deliveryStatus) => updateOrderStatus({ orderId: order.id, deliveryStatus })}
                />
            </div>
        </article>
    );
});

AdminOrderRow.displayName = 'AdminOrderRow';
