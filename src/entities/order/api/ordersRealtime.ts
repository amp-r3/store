import { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { supabase, Database } from '@/shared/api';
import { OrderStatus, DeliveryStatus, PaymentStatus } from '../model/types';

type OrderRow = Database['public']['Tables']['orders']['Row'];

export interface OrderStatusChange {
    orderId: string;
    orderNumber: string | null;
    status: OrderStatus;
    deliveryStatus: DeliveryStatus;
    paymentStatus: PaymentStatus;
    // Which field(s) actually changed vs. the previous row — lets the caller
    // report on the most specific one (e.g. delivery over the derived
    // aggregate `status`) rather than always announcing `status`.
    changed: {
        status: boolean;
        deliveryStatus: boolean;
        paymentStatus: boolean;
    };
}

const diffStatuses = (payload: RealtimePostgresUpdatePayload<OrderRow>): OrderStatusChange['changed'] => {
    const { old: previous, new: next } = payload;
    return {
        status: previous.status !== next.status,
        deliveryStatus: previous.delivery_status !== next.delivery_status,
        paymentStatus: previous.payment_status !== next.payment_status,
    };
};

export const subscribeToOrderChanges = (
    userId: string,
    onChange: (change: OrderStatusChange) => void
): (() => void) => {
    const channel = supabase
        .channel(`orders-status-${userId}`)
        .on<OrderRow>(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                const changed = diffStatuses(payload);
                if (!changed.status && !changed.deliveryStatus && !changed.paymentStatus) return;

                onChange({
                    orderId: payload.new.id,
                    orderNumber: payload.new.order_number,
                    status: payload.new.status,
                    deliveryStatus: payload.new.delivery_status,
                    paymentStatus: payload.new.payment_status,
                    changed,
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};
