import { CreateOrderPayload, ShippingAddress } from '../model/types';
import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';
import { Order, OrderCounts, OrdersScope, DeliveryMethod, PaymentMethod, OrderStatusEvent } from '@/entities/order/model/types';
import { TERMINAL_ORDER_STATUSES } from '@/entities/order/config/order-management.config';
import { fetchDeliveryMethods, fetchPaymentMethods } from './queries';
import { getErrorMessage } from '@/shared/lib';

const TERMINAL_STATUSES_LIST = `(${TERMINAL_ORDER_STATUSES.join(',')})`;

// embedded relations from the select below (postgrest-js doesn't infer these).
// Exported (with ORDERS_SELECT/mapOrderResponseToOrder below) so
// entities/admin's adminOrdersApi can read the same admin-scoped `orders`
// rows without re-deriving this mapping — see that file for why the admin
// order endpoints live outside this entity.
export type OrderRow = Database['public']['Tables']['orders']['Row'] & {
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

export const ORDERS_SELECT = `
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


export const mapOrderResponseToOrder = (order: OrderRow): Order => ({
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

const mapStatusEventRow = (row: Database['public']['Tables']['order_status_events']['Row']): OrderStatusEvent => ({
  id: row.id,
  orderId: row.order_id,
  status: row.status,
  paymentStatus: row.payment_status,
  deliveryStatus: row.delivery_status,
  createdAt: row.created_at,
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
    ? query.in('status', TERMINAL_ORDER_STATUSES)
    : query.not('status', 'in', TERMINAL_STATUSES_LIST);

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
            .not('status', 'in', TERMINAL_STATUSES_LIST),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', TERMINAL_ORDER_STATUSES),
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
        try {
          return { data: await fetchDeliveryMethods(supabase) };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
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
        try {
          return { data: await fetchPaymentMethods(supabase) };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: ['PaymentMethod'],
    }),

    // RLS on order_status_events gates rows to the order's own owner or an
    // admin (public.is_admin()), so this one endpoint serves both the
    // customer and the admin order-details drawer — no separate admin query.
    getOrderStatusEvents: builder.query<OrderStatusEvent[], string>({
      queryFn: async (orderId) => {
        const { data, error } = await supabase
          .from('order_status_events')
          .select('id, order_id, status, payment_status, delivery_status, created_at')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: data.map(mapStatusEventRow) };
      },
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
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
  useGetOrderStatusEventsQuery,
} = orderApi;