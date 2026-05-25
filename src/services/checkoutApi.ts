import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { CreateOrderPayload, DeliveryMethod, DeliveryOptions, PaymentMethod, PaymentOptions, ShippingAddress } from '@/types/checkout';
import { supabase } from '@/supabase';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';

interface DeliveryMethodResponse {
  id: string;
  code: DeliveryOptions;
  name: string;
  price: number;
  estimated_time: string;
  is_active: boolean;
  free_from_price: number | null;
}

interface PaymentMethodResponse {
  id: string;
  code: PaymentOptions;
  name: string;
  fee_percentage: number;
  fee_fixed: number
}


interface OrderResponse {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  payment_methods: PaymentMethodResponse;
  payment_status: PaymentStatus;
  delivery_method_id: string | null;
  delivery_cost: number;
  payment_fee: number;
  delivery_methods: DeliveryMethodResponse;
  order_items: {
    id: string;
    order_id: string;
    product_id: number;
    quantity: number;
    price_at_purchase: number;
    created_at: string;
  }[];
}

export const checkoutApi = createApi({
  reducerPath: 'checkoutApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getDeliveryMethods: builder.query<DeliveryMethod[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('delivery_methods')
          .select('*')
        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const methods = (data as DeliveryMethodResponse[]).map((method) => {
          return {
            id: method.id,
            code: method.code,
            label: method.name,
            price: method.price,
            duration: method.estimated_time,
            freeFromPrice: method.free_from_price,
            isActive: method.is_active
          }
        })
        return { data: methods as DeliveryMethod[] };
      },
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

        const methods = (data as PaymentMethodResponse[]).map((method) => {
          return {
            id: method.id,
            code: method.code,
            name: method.name,
            feePercentage: method.fee_percentage,
            feeFixed: method.fee_fixed
          }
        })
        return { data: methods as PaymentMethod[] };
      },
    }),
    getOrders: builder.query<Order[], void>({
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const { data, error } = await supabase
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
              quantity,
              price_at_purchase,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log(data);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const orders: Order[] = (data as OrderResponse[]).map((order) => {
          return {
            id: order.id,
            userId: order.user_id,
            status: order.status,
            totalAmount: Number(order.total_amount),
            shippingAddress: order.shipping_address,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            paymentMethod: order.payment_methods.name,
            paymentStatus: order.payment_status,
            deliveryMethod_id: order.delivery_method_id ? String(order.delivery_method_id) : null,
            deliveryCost: Number(order.delivery_cost),
            paymentFee: Number(order.payment_fee),
            deliveryMethods: {
              id: order.delivery_methods.id,
              code: order.delivery_methods.code,
              label: order.delivery_methods.name,
              isActive: order.delivery_methods.is_active,
              duration: order.delivery_methods.estimated_time,
              price: order.delivery_methods.price,
              freeFromPrice: order.delivery_methods.free_from_price
            },
            orderItems: (order.order_items || []).map((item) => ({
              id: item.id,
              orderId: item.order_id,
              productId: Number(item.product_id),
              quantity: item.quantity,
              priceAtPurchase: Number(item.price_at_purchase),
              createdAt: item.created_at,
            })),
          };
        });

        return { data: orders };
      },
      providesTags: ['Order']
    }),

    createOrder: builder.mutation<string, CreateOrderPayload>({
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
  useGetDeliveryMethodsQuery,
  useGetPaymentMethodsQuery,
  useGetOrdersQuery,
  useCreateOrderMutation
} = checkoutApi;