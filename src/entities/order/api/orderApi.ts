import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { CreateOrderPayload, ShippingAddress } from '@/features/checkout-process/model/types';
import { supabase } from '@/shared/api';
import { DeliveryStatus, Order, OrderStatus, PaymentStatus } from '@/entities/order/model/types';

interface DeliveryMethodResponse {
  id: string;
  code: string;
  name: string;
  price: number;
  estimated_time: string;
  is_active: boolean;
  free_from_price: number | null;
}

interface PaymentMethodResponse {
  id: string;
  code: string;
  name: string;
  fee_percentage: number;
  fee_fixed: number;
}

interface OrderResponse {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  payment_methods: PaymentMethodResponse;
  payment_status: PaymentStatus;
  delivery_status: DeliveryStatus;
  delivery_method_id: string | null;
  delivery_cost: number;
  payment_fee: number;
  delivery_methods: DeliveryMethodResponse;
  order_items: {
    id: string;
    order_id: string;
    product_id: number;
    size_id: number;
    quantity: number;
    price_at_purchase: number;
    created_at: string;
  }[];
}

export interface CreateOrderResponse {
  id: string;
  order_number: string;
}

export interface PaginatedOrders {
  items: Order[];
  totalCount: number;
}

const mapOrderResponseToOrder = (order: OrderResponse): Order => ({
  id: order.id,
  orderId: order.order_number,
  userId: order.user_id,
  status: order.status,
  totalAmount: Number(order.total_amount),
  shippingAddress: order.shipping_address,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
  paymentMethod: order.payment_methods.code as any,
  paymentStatus: order.payment_status,
  deliveryStatus: order.delivery_status,
  deliveryMethod_id: order.delivery_methods.id,
  deliveryCost: Number(order.delivery_cost),
  paymentFee: Number(order.payment_fee),
  deliveryMethods: {
    id: order.delivery_methods.id,
    code: order.delivery_methods.code as any,
    label: order.delivery_methods.name,
    isActive: order.delivery_methods.is_active,
    duration: order.delivery_methods.estimated_time,
    price: order.delivery_methods.price,
    freeFromPrice: order.delivery_methods.free_from_price,
  },
  orderItems: (order.order_items || []).map((item) => ({
    id: item.id,
    orderId: item.order_id,
    productId: Number(item.product_id),
    sizeId: Number(item.size_id),
    quantity: item.quantity,
    priceAtPurchase: Number(item.price_at_purchase),
    createdAt: item.created_at,
  })),
});

const fetchOrders = async (page: number, limit: number) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { status: 401, data: 'The user is not authorized' } };
  }

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select(`
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
          `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { error: { status: 400, data: error.message } };
  }

  return {
    data: {
      items: (data as OrderResponse[]).map(mapOrderResponseToOrder),
      totalCount: count || 0
    }
  };
};

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrdersPagination: builder.query<PaginatedOrders, { page: number; limit: number }>({
      queryFn: ({ page, limit }) => fetchOrders(page, limit),
      providesTags: ['Order']
    }),

    getOrdersScroll: builder.query<PaginatedOrders, { page: number; limit: number }>({
      queryFn: ({ page, limit }) => fetchOrders(page, limit),
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
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
        return currentArg?.page !== previousArg?.page || currentArg?.limit !== previousArg?.limit;
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
          .rpc('create_order', payload);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data };
      },
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersPaginationQuery,
  useGetOrdersScrollQuery,
  useCreateOrderMutation
} = orderApi;