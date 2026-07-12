import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { DeliveryMethod, DeliveryOptions, PaymentMethod, PaymentOptions } from '@/features/checkout-process/model/types';
import { supabase } from '@/shared/api';

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

export const checkoutApi = createApi({
  reducerPath: 'checkoutApi',
  baseQuery: fakeBaseQuery(),
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
  }),
});

export const {
  useGetDeliveryMethodsQuery,
  useGetPaymentMethodsQuery,
} = checkoutApi;
