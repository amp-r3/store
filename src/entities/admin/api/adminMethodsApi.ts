import { supabase, baseApi } from '@/shared/api';

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
    updateAdminDeliveryMethod: builder.mutation<null, { id: string; payload: UpdateDeliveryMethodPayload }>({
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

    updateAdminPaymentMethod: builder.mutation<null, { id: string; payload: UpdatePaymentMethodPayload }>({
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

export const { useUpdateAdminDeliveryMethodMutation, useUpdateAdminPaymentMethodMutation } = adminMethodsApi;
