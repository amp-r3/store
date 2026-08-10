import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';

export interface AdminDeliveryMethod {
  id: string;
  code: Database['public']['Enums']['delivery_method_type'];
  name: string;
  price: number;
  estimatedTime: string | null;
  isActive: boolean;
  freeFromPrice: number | null;
}

export interface AdminPaymentMethod {
  id: string;
  code: Database['public']['Enums']['payment_method_type'];
  name: string;
  feePercentage: number;
  feeFixed: number;
  isActive: boolean;
}

export interface UpdateDeliveryMethodPayload {
  name?: string;
  price?: number;
  estimatedTime?: string;
  isActive?: boolean;
  freeFromPrice?: number | null;
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  feePercentage?: number;
  feeFixed?: number;
  isActive?: boolean;
}

export const adminMethodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // No create/delete: delivery_method_type/payment_method_type are fixed
    // enums and orders.delivery_method_id/payment_method_id are `on delete
    // restrict` — the set of methods is meant to stay fixed, only their
    // price/fee/copy/is_active changes.

    // Deliberately NOT the customer-facing getDeliveryMethods query
    // (entities/order): that one filters .eq('is_active', true), so a
    // disabled method could never be found again to re-enable it. The RLS
    // "Anyone can view delivery methods" policy has no role restriction, so
    // an unfiltered select works here too.
    getAdminDeliveryMethods: builder.query<AdminDeliveryMethod[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('delivery_methods').select('*').order('price');

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const methods: AdminDeliveryMethod[] = (data ?? []).map((method) => ({
          id: method.id,
          code: method.code,
          name: method.name,
          price: method.price,
          estimatedTime: method.estimated_time,
          isActive: method.is_active,
          freeFromPrice: method.free_from_price,
        }));

        return { data: methods };
      },
      providesTags: ['DeliveryMethod'],
    }),

    getAdminPaymentMethods: builder.query<AdminPaymentMethod[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('payment_methods').select('*').order('name');

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const methods: AdminPaymentMethod[] = (data ?? []).map((method) => ({
          id: method.id,
          code: method.code,
          name: method.name,
          feePercentage: method.fee_percentage,
          feeFixed: method.fee_fixed,
          isActive: method.is_active,
        }));

        return { data: methods };
      },
      providesTags: ['PaymentMethod'],
    }),

    updateAdminDeliveryMethod: builder.mutation<
      null,
      { id: string; payload: UpdateDeliveryMethodPayload }
    >({
      queryFn: async ({ id, payload }) => {
        const { error } = await supabase.rpc('admin_update_delivery_method', {
          p_id: id,
          p_payload: {
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.price !== undefined && { price: payload.price }),
            ...(payload.estimatedTime !== undefined && { estimated_time: payload.estimatedTime }),
            ...(payload.isActive !== undefined && { is_active: payload.isActive }),
            ...(payload.freeFromPrice !== undefined && { free_from_price: payload.freeFromPrice }),
          },
        });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: ['DeliveryMethod'],
    }),

    updateAdminPaymentMethod: builder.mutation<
      null,
      { id: string; payload: UpdatePaymentMethodPayload }
    >({
      queryFn: async ({ id, payload }) => {
        const { error } = await supabase.rpc('admin_update_payment_method', {
          p_id: id,
          p_payload: {
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.feePercentage !== undefined && { fee_percentage: payload.feePercentage }),
            ...(payload.feeFixed !== undefined && { fee_fixed: payload.feeFixed }),
            ...(payload.isActive !== undefined && { is_active: payload.isActive }),
          },
        });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: ['PaymentMethod'],
    }),
  }),
});

export const {
  useGetAdminDeliveryMethodsQuery,
  useGetAdminPaymentMethodsQuery,
  useUpdateAdminDeliveryMethodMutation,
  useUpdateAdminPaymentMethodMutation,
} = adminMethodsApi;
