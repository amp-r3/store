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
    OrderStatusSelect,
} from '@/entities/order';
import { useUpdateOrderStatusMutation, OrderStatusTransitions } from '@/entities/admin';
import { formatPrice, formatDate } from '@/shared/lib';

import style from './admin-order-row.module.scss';

interface AdminOrderRowProps {
    order: Order;
    /** `undefined` while the transition matrix is still loading/errored. */
    transitions?: OrderStatusTransitions;
    onOpenDetails: (orderId: string) => void;
}

export const AdminOrderRow = memo(({ order, transitions, onOpenDetails }: AdminOrderRowProps) => {
    const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
    const { firstName, lastName, email } = order.shippingAddress;
    const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // toMap() in adminOrdersApi only creates keys for statuses with outgoing
    // rows, so a terminal status comes back `undefined` — normalise to `[]`
    // here so "terminal" reads as locked, not as "matrix still loading".
    const allowedPaymentValues = transitions ? (transitions.payment[order.paymentStatus] ?? []) : undefined;
    const allowedDeliveryValues = transitions ? (transitions.delivery[order.deliveryStatus] ?? []) : undefined;

    return (
        <article role="listitem" className={style['admin-order-row']}>
            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Order</span>
                <button
                    type="button"
                    className={style['admin-order-row__order-number']}
                    onClick={() => onOpenDetails(order.id)}
                >
                    #{order.orderId}
                </button>
                <span className={style['admin-order-row__date']}>{formatDate(order.createdAt, 'medium')}</span>
            </div>

            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Customer</span>
                <span className={style['admin-order-row__customer-name']}>{firstName} {lastName}</span>
                <span className={style['admin-order-row__customer-email']}>{email}</span>
            </div>

            <div className={style['admin-order-row__cell']}>
                <span className={style['admin-order-row__cell-label']}>Total</span>
                <span className={style['admin-order-row__total']}>{formatPrice(order.totalAmount)}</span>
                <span className={style['admin-order-row__items']}>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
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
                <OrderStatusSelect<PaymentStatus>
                    label="Payment status"
                    value={order.paymentStatus}
                    options={PAYMENT_STATUS_OPTIONS}
                    statusMap={PAYMENT_STATUS_MAP}
                    disabled={isLoading}
                    allowedValues={allowedPaymentValues}
                    onChange={(paymentStatus) => updateOrderStatus({ orderId: order.id, paymentStatus })}
                />
            </div>

            <div className={style['admin-order-row__cell']}>
                <OrderStatusSelect<DeliveryStatus>
                    label="Delivery status"
                    value={order.deliveryStatus}
                    options={DELIVERY_STATUS_OPTIONS}
                    statusMap={DELIVERY_STATUS_MAP}
                    disabled={isLoading}
                    allowedValues={allowedDeliveryValues}
                    onChange={(deliveryStatus) => updateOrderStatus({ orderId: order.id, deliveryStatus })}
                />
            </div>
        </article>
    );
});

AdminOrderRow.displayName = 'AdminOrderRow';
