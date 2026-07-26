import { useMemo } from 'react';
import {
  useGetDeliveryMethodsQuery,
  useGetPaymentMethodsQuery,
  DeliveryOptions,
  PaymentOptions,
} from '@/entities/order';

export const useCheckoutDelivery = (deliveryCode?: DeliveryOptions, paymentCode?: PaymentOptions) => {
  const {
    data: deliveryMethods,
    isLoading: isDeliveryLoading,
    isFetching: isDeliveryFetching,
    isError: isDeliveryError,
  } = useGetDeliveryMethodsQuery();

  const {
    data: paymentMethods,
    isLoading: isPaymentLoading,
    isFetching: isPaymentFetching,
    isError: isPaymentError,
  } = useGetPaymentMethodsQuery();

  const selectedDelivery = useMemo(
    () => deliveryMethods?.find((method) => method.code === deliveryCode),
    [deliveryMethods, deliveryCode]
  );

  const selectedPayment = useMemo(
    () => paymentMethods?.find((method) => method.code === paymentCode),
    [paymentMethods, paymentCode]
  );

  const freeShippingThreshold = useMemo(
    () => deliveryMethods?.find(
      (method) => method.freeFromPrice !== null && method.freeFromPrice > 0
    )?.freeFromPrice ?? null,
    [deliveryMethods]
  );

  const isShippingRequired = deliveryCode !== 'pickup';

  return {
    deliveryMethods,
    paymentMethods,
    selectedDelivery,
    selectedPayment,
    freeShippingThreshold,
    isShippingRequired,
    isLoading: isDeliveryLoading || isPaymentLoading,
    isFetching: isDeliveryFetching || isPaymentFetching,
    isError: isDeliveryError || isPaymentError,
    isDeliveryLoading,
    isPaymentLoading,
  };
};
