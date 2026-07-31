import { CreateOrderPayload, ShippingAddress } from '../model/types';
import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';
import { Order, OrderCounts, OrdersScope, DeliveryMethod, PaymentMethod, AdminOrderStatusFilter, PaymentStatus, DeliveryStatus } from '@/entities/order/model/types';

// embedded relations from the select below (postgrest-js doesn't infer these)
type OrderRow = Database['public']['Tables']['orders']['Row'] & {
  delivery_methods: Database['public']['Tables']['delivery_methods']['Row'];
  payment_methods: Database['public']['Tables']['payment_methods']['Row'];
  order_items: Database['public']['Tables']['order_items']['Row'][];
};

export interface CreateOrderResponse {
  id: string;
  order_number: string;
}

export interface PaginatedOrders {
  items: Order[];
  totalCount: number;
}

interface OrdersQueryArgs {
  page: number;
  limit: number;
  scope: OrdersScope;
}

export interface AdminOrdersQueryArgs {
  page: number;
  limit: number;
  status: AdminOrderStatusFilter;
  /** Trimmed order_number fragment; empty/undefined = no filter. */
  search?: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
}

const ORDERS_SELECT = `
  *,
  delivery_methods (
    *
  ),
  payment_methods (
    *
  ),
  order_items (
    id,
    order_id,
    product_id,
    size_id,
    quantity,
    price_at_purchase,
    created_at
  )
`;


const mapOrderResponseToOrder = (order: OrderRow): Order => ({
  id: order.id,
  // order_number is nullable in the schema but always set by the create_order
  // RPC (the only insert path); fall back to the row id rather than drop it.
  orderId: order.order_number ?? order.id,
  userId: order.user_id,
  status: order.status,
  totalAmount: Number(order.total_amount),
  // shipping_address is stored as jsonb with no schema-level shape guarantee;
  // the app controls both write (create_order) and read side of this shape.
  shippingAddress: order.shipping_address as unknown as ShippingAddress,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
  paymentMethod: order.payment_methods.code,
  paymentStatus: order.payment_status,
  deliveryStatus: order.delivery_status,
  deliveryMethod_id: order.delivery_methods.id,
  deliveryCost: Number(order.delivery_cost),
  paymentFee: Number(order.payment_fee),
  deliveryMethods: {
    id: order.delivery_methods.id,
    code: order.delivery_methods.code,
    label: order.delivery_methods.name,
    isActive: order.delivery_methods.is_active,
    // estimated_time is genuinely nullable in the schema (no NOT NULL).
    duration: order.delivery_methods.estimated_time ?? '',
    price: order.delivery_methods.price,
    freeFromPrice: order.delivery_methods.free_from_price,
  },
  orderItems: order.order_items.map((item) => ({
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    sizeId: item.size_id,
    quantity: item.quantity,
    priceAtPurchase: Number(item.price_at_purchase),
    createdAt: item.created_at,
  })),
});

const fetchOrders = async ({ page, limit, scope }: OrdersQueryArgs) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { status: 401, data: 'The user is not authorized' } };
  }

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  let query = supabase
    .from('orders')
    .select(ORDERS_SELECT, { count: 'exact' })
    .eq('user_id', user.id);

  query = scope === 'completed'
    ? query.in('status', ['completed', 'cancelled'])
    : query.not('status', 'in', '(completed,cancelled)');

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { error: { status: 400, data: error.message } };
  }

  return {
    data: {
      // Multi-embed select (delivery_methods + payment_methods + order_items)
      // isn't narrowed precisely by postgrest-js's select-string inference;
      // OrderRow is composed entirely from generated table types.
      items: (data as unknown as OrderRow[]).map(mapOrderResponseToOrder),
      totalCount: count || 0
    }
  };
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrdersPagination: builder.query<PaginatedOrders, OrdersQueryArgs>({
      queryFn: (args) => fetchOrders(args),
      providesTags: ['Order']
    }),

    getOrdersScroll: builder.query<PaginatedOrders, OrdersQueryArgs>({
      queryFn: (args) => fetchOrders(args),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.scope}`;
      },
      merge: (currentCache, newResponse, { arg }) => {
        if (arg?.page === 1) {
          currentCache.items = newResponse.items;
        } else {
          const existingIds = new Set(currentCache.items.map((item) => item.id));
          const uniqueNewItems = newResponse.items.filter((item) => !existingIds.has(item.id));
          currentCache.items.push(...uniqueNewItems);
        }
        currentCache.totalCount = newResponse.totalCount;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
          || currentArg?.limit !== previousArg?.limit
          || currentArg?.scope !== previousArg?.scope;
      },
      providesTags: ['Order']
    }),

    getOrderById: builder.query<Order, string>({
      queryFn: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const { data, error } = await supabase
          .from('orders')
          .select(ORDERS_SELECT)
          .eq('user_id', user.id)
          .eq('id', id)
          .single();

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: mapOrderResponseToOrder(data as unknown as OrderRow) };
      },
      providesTags: ['Order']
    }),

    // Admin scope: all customers' orders, not just the caller's. Differs from
    // fetchOrders in three ways: no supabase.auth.getUser() guard (AdminRoute
    // already guarantees an authenticated admin, and the id isn't needed
    // here — skip the round-trip), no .eq('user_id') (the "Admins can view
    // all orders" RLS policy is what widens the read, see the migration), and
    // a status/search filter instead of the active/completed scope split.
    //
    // Without .eq('user_id'), a non-admin calling this doesn't get an error —
    // the permissive-OR RLS policy silently narrows the result to their own
    // orders. That's the correct failure mode (fail-closed on data); the real
    // gates are AdminRoute on the client and is_admin() inside every admin RPC.
    getAllOrders: builder.query<PaginatedOrders, AdminOrdersQueryArgs>({
      queryFn: async ({ page, limit, status, search }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
          .from('orders')
          .select(ORDERS_SELECT, { count: 'exact' });

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
          query = query.ilike('order_number', `%${trimmedSearch}%`);
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
          }
        };
      },
      providesTags: ['Order']
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
      invalidatesTags: ['Order']
    }),

    getOrderCounts: builder.query<OrderCounts, void>({
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const [active, completed] = await Promise.all([
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('status', 'in', '(completed,cancelled)'),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['completed', 'cancelled']),
        ]);

        if (active.error || completed.error) {
          return { error: { status: 400, data: (active.error ?? completed.error)!.message } };
        }

        return { data: { active: active.count ?? 0, completed: completed.count ?? 0 } };
      },
      providesTags: ['Order']
    }),

    createOrder: builder.mutation<CreateOrderResponse, CreateOrderPayload>({
      queryFn: async (payload) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const { data, error } = await supabase
          // create_order's Args are typed as generic Json server-side (the
          // function accepts jsonb parameters); payload matches the expected
          // shape but has no index signature to satisfy Json structurally.
          .rpc('create_order', payload as unknown as Database['public']['Functions']['create_order']['Args']);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        // create_order returns jsonb_build_object('id', ..., 'order_number', ...);
        // the RPC's generated return type is generic Json.
        return { data: data as unknown as CreateOrderResponse };
      },
      invalidatesTags: ['Order', 'Cart', 'Product'],
    }),

    getDeliveryMethods: builder.query<DeliveryMethod[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('delivery_methods')
          .select('*')
          .eq('is_active', true);
        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const methods: DeliveryMethod[] = (data ?? []).map((method) => ({
          id: method.id,
          code: method.code,
          label: method.name,
          price: method.price,
          duration: method.estimated_time ?? '',
          freeFromPrice: method.free_from_price,
          isActive: method.is_active
        }));
        return { data: methods };
      },
      providesTags: ['DeliveryMethod'],
    }),

    getLastShippingAddress: builder.query<ShippingAddress | null, void>({
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const { data, error } = await supabase
          .from('orders')
          .select('shipping_address')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        // shipping_address is stored as jsonb with no schema-level shape guarantee;
        // the app controls both write (create_order) and read side of this shape.
        return { data: (data?.shipping_address as unknown as ShippingAddress) ?? null };
      },
      providesTags: ['Order'],
    }),

    getPaymentMethods: builder.query<PaymentMethod[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('id, code, fee_percentage, fee_fixed, name')
          .eq('is_active', true);
        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const methods: PaymentMethod[] = (data ?? []).map((method) => ({
          id: method.id,
          code: method.code,
          name: method.name,
          feePercentage: method.fee_percentage,
          feeFixed: method.fee_fixed
        }));
        return { data: methods };
      },
      providesTags: ['PaymentMethod'],
    }),
  }),
});

export const {
  useGetOrdersPaginationQuery,
  useGetOrdersScrollQuery,
  useGetOrderByIdQuery,
  useGetOrderCountsQuery,
  useCreateOrderMutation,
  useGetDeliveryMethodsQuery,
  useGetPaymentMethodsQuery,
  useGetLastShippingAddressQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi;