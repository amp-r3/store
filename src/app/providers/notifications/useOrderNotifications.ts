import { useEffect } from 'react';
import { baseApi } from '@/shared/api';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { selectUser } from '@/entities/session';
import { notify, NotificationType } from '@/entities/notification';
import {
    subscribeToOrderChanges,
    OrderStatusChange,
    ORDER_STATUS_MAP,
    DELIVERY_STATUS_MAP,
    PAYMENT_STATUS_MAP,
} from '@/entities/order';

const ERROR_STATUSES = new Set(['cancelled', 'failed']);
const SUCCESS_STATUSES = new Set(['completed', 'delivered', 'paid']);

const resolveNotificationType = (rawValue: string): NotificationType => {
    if (ERROR_STATUSES.has(rawValue)) return 'error';
    if (SUCCESS_STATUSES.has(rawValue)) return 'success';
    return 'info';
};

const buildNotificationText = (change: OrderStatusChange): { text: string; type: NotificationType } => {
    const orderLabel = change.orderNumber ?? change.orderId;

    // Prefer the most specific field that actually changed — delivery/payment
    // are more informative than the derived aggregate `status`.
    if (change.changed.deliveryStatus) {
        const meta = DELIVERY_STATUS_MAP[change.deliveryStatus];
        return { text: `Order ${orderLabel} — ${meta.label}`, type: resolveNotificationType(change.deliveryStatus) };
    }
    if (change.changed.paymentStatus) {
        const meta = PAYMENT_STATUS_MAP[change.paymentStatus];
        return { text: `Order ${orderLabel} — ${meta.label}`, type: resolveNotificationType(change.paymentStatus) };
    }
    const meta = ORDER_STATUS_MAP[change.status];
    return { text: `Order ${orderLabel} — ${meta.label}`, type: resolveNotificationType(change.status) };
};

export const useOrderNotifications = () => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector(selectUser)?.id;

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToOrderChanges(userId, (change) => {
            const { text, type } = buildNotificationText(change);

            dispatch(notify({
                type,
                text,
                key: `order-${change.orderId}`,
                action: { label: 'View orders', to: '/user/orders' },
            }));
            dispatch(baseApi.util.invalidateTags(['Order']));
        });

        return unsubscribe;
    }, [userId, dispatch]);
};
