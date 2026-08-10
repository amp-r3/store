import { supabase, baseApi } from '@/shared/api';
import type {
  PaymentStatus,
  DeliveryStatus,
  AdminOrderStatusFilter,
  PaginatedOrders,
  Order,
} from '@/entities/order';
// Read-only, one-directional entity↔entity import: reuses entities/order's
// own select string, row type and mapper instead of re-deriving them here.
// Flagged per AGENTS.md's entity cross-import rule — order never imports
// back from admin, so the dependency stays one-way.
import { ORDERS_SELECT, OrderRow, mapOrderResponseToOrder } from '@/entities/order';

export interface OrderStatusTransitions {
  payment: Record<PaymentStatus, PaymentStatus[]>;
  delivery: Record<DeliveryStatus, DeliveryStatus[]>;
}

export interface AdminOrdersQueryArgs {
  page: number;
  limit: number;
  status: AdminOrderStatusFilter;
  /** Trimmed order_number fragment; empty/undefined = no filter. */
  search?: string;
  /** Inclusive date-only bounds (YYYY-MM-DD); undefined = no bound. */
  dateFrom?: string;
  dateTo?: string;
  /** Scopes to a single customer's orders — used by the customer details drawer. */
  userId?: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
}

export const adminOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin scope: all customers' orders, not just the caller's. Differs from
    // the customer-scoped queries in entities/order in three ways: no
    // supabase.auth.getUser() guard (AdminRoute already guarantees an
    // authenticated admin, and the id isn't needed here — skip the round
    // trip), no .eq('user_id') (the "Admins can view all orders" RLS policy
    // is what widens the read, see 20260731071206), and a status/search
    // filter instead of the active/completed scope split.
    //
    // Without .eq('user_id'), a non-admin calling this doesn't get an error —
    // the permissive-OR RLS policy silently narrows the result to their own
    // orders. That's the correct failure mode (fail-closed on data); the real
    // gates are AdminRoute on the client and is_admin() inside every admin RPC.
    getAllOrders: builder.query<PaginatedOrders, AdminOrdersQueryArgs>({
      queryFn: async ({ page, limit, status, search, dateFrom, dateTo, userId }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase.from('orders').select(ORDERS_SELECT, { count: 'exact' });

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        // Also covered by "Admins can view all orders", same as the rest of
        // this query — scoping to one customer for the details drawer.
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
          query = query.ilike('order_number', `%${trimmedSearch}%`);
        }

        if (dateFrom) {
          query = query.gte('created_at', new Date(`${dateFrom}T00:00:00.000`).toISOString());
        }

        // End-of-day bound: a same-day from/to must still include that day's
        // orders, not just those created before midnight.
        if (dateTo) {
          query = query.lte('created_at', new Date(`${dateTo}T23:59:59.999`).toISOString());
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return {
          data: {
            items: (data as unknown as OrderRow[]).map(mapOrderResponseToOrder),
            totalCount: count || 0,
          },
        };
      },
      providesTags: ['Order'],
    }),

    // The only other admin write path alongside create_order, both SECURITY
    // DEFINER RPCs — orders/order_items keep zero UPDATE policies by design
    // (see 20260723071805_harden_order_write_paths.sql), since a column-blind
    // UPDATE policy would both expose every other order column to an admin
    // and bypass sync_order_main_status() (a `before update of payment_status,
    // delivery_status` trigger), letting `status` desync from the two values
    // it's derived from.
    //
    // No optimistic update: `status` is computed server-side by that trigger,
    // and reimplementing its branching in TypeScript would drift the moment
    // the SQL changes. Plain invalidation is the correct trade-off here.
    updateOrderStatus: builder.mutation<null, UpdateOrderStatusPayload>({
      queryFn: async ({ orderId, paymentStatus, deliveryStatus }) => {
        const { error } = await supabase.rpc('admin_update_order_status', {
          p_order_id: orderId,
          ...(paymentStatus !== undefined && { p_payment_status: paymentStatus }),
          ...(deliveryStatus !== undefined && { p_delivery_status: deliveryStatus }),
        });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      // Also invalidates StatusTransition-adjacent 'Order' consumers (admin
      // dashboard stats, order-by-status breakdown) that tag on 'Order'.
      invalidatesTags: ['Order'],
    }),

    // entities/order's getOrderById hard-filters .eq('user_id', user.id), so
    // it can't serve an admin looking up any customer's order. Same RLS
    // widening as getAllOrders above — no user_id filter, admin-only access
    // is enforced by AdminRoute + is_admin() inside the write-path RPCs.
    getAdminOrderById: builder.query<Order, string>({
      queryFn: async (orderId) => {
        const { data, error } = await supabase
          .from('orders')
          .select(ORDERS_SELECT)
          .eq('id', orderId)
          .single();

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: mapOrderResponseToOrder(data as unknown as OrderRow) };
      },
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),

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

        const toMap = <T extends string>(
          rows: { from_status: T; to_status: T }[],
        ): Record<T, T[]> => {
          const map = {} as Record<T, T[]>;
          for (const row of rows) {
            (map[row.from_status] ??= []).push(row.to_status);
          }
          return map;
        };

        return {
          data: {
            payment: toMap(
              payment.data as { from_status: PaymentStatus; to_status: PaymentStatus }[],
            ),
            delivery: toMap(
              delivery.data as { from_status: DeliveryStatus; to_status: DeliveryStatus }[],
            ),
          },
        };
      },
      providesTags: ['StatusTransition'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatusTransitionsQuery,
} = adminOrdersApi;
