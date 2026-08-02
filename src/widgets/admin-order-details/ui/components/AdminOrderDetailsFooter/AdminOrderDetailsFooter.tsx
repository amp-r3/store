import { FC } from 'react';
import {
    Order,
    PaymentStatus,
    DeliveryStatus,
    PAYMENT_STATUS_OPTIONS,
    DELIVERY_STATUS_OPTIONS,
    PAYMENT_STATUS_MAP,
    DELIVERY_STATUS_MAP,
    OrderStatusSelect,
} from '@/entities/order';
import { useUpdateOrderStatusMutation, useGetOrderStatusTransitionsQuery } from '@/entities/admin';
import style from './admin-order-details-footer.module.scss';

interface AdminOrderDetailsFooterProps {
    order: Order;
}

export const AdminOrderDetailsFooter: FC<AdminOrderDetailsFooterProps> = ({ order }) => {
    const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
    // Same cache entry AdminOrdersPage subscribes to (void arg) — RTK Query
    // dedupes the request, this doesn't refetch a second time.
    const { data: transitions } = useGetOrderStatusTransitionsQuery();

    const allowedPaymentValues = transitions ? (transitions.payment[order.paymentStatus] ?? []) : undefined;
    const allowedDeliveryValues = transitions ? (transitions.delivery[order.deliveryStatus] ?? []) : undefined;

    return (
        <footer className={style['footer']}>
            {isLoading && (
                <span className={style['footer__updating']} role="status" aria-live="polite">
                    Updating…
                </span>
            )}
            <div className={style['footer__selects']}>
                <OrderStatusSelect<PaymentStatus>
                    label="Payment status"
                    value={order.paymentStatus}
                    options={PAYMENT_STATUS_OPTIONS}
                    statusMap={PAYMENT_STATUS_MAP}
                    disabled={isLoading}
                    allowedValues={allowedPaymentValues}
                    onChange={(paymentStatus) => updateOrderStatus({ orderId: order.id, paymentStatus })}
                />
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
        </footer>
    );
};
