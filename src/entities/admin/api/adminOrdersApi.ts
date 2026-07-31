import { supabase, baseApi } from '@/shared/api';
import type { PaymentStatus, DeliveryStatus } from '@/entities/order';

export interface OrderStatusTransitions {
  payment: Record<PaymentStatus, PaymentStatus[]>;
  delivery: Record<DeliveryStatus, DeliveryStatus[]>;
}

export const adminOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Single source of truth for legal status moves lives in the DB
    // (payment_status_transitions / delivery_status_transitions), read by
    // admin_update_order_status itself. The UI reads the same tables so the
    // matrix never has to be duplicated in TypeScript. Cached for the whole
    // session — these tables only change via migration.
    getOrderStatusTransitions: builder.query<OrderStatusTransitions, void>({
      queryFn: async () => {
        const [payment, delivery] = await Promise.all([
          supabase.from('payment_status_transitions').select('from_status, to_status'),
          supabase.from('delivery_status_transitions').select('from_status, to_status'),
        ]);

        if (payment.error || delivery.error) {
          return { error: { status: 400, data: (payment.error ?? delivery.error)!.message } };
        }

        const toMap = <T extends string>(rows: { from_status: T; to_status: T }[]): Record<T, T[]> => {
          const map = {} as Record<T, T[]>;
          for (const row of rows) {
            (map[row.from_status] ??= []).push(row.to_status);
          }
          return map;
        };

        return {
          data: {
            payment: toMap(payment.data as { from_status: PaymentStatus; to_status: PaymentStatus }[]),
            delivery: toMap(delivery.data as { from_status: DeliveryStatus; to_status: DeliveryStatus }[]),
          },
        };
      },
      providesTags: ['StatusTransition'],
    }),
  }),
});

export const { useGetOrderStatusTransitionsQuery } = adminOrdersApi;
