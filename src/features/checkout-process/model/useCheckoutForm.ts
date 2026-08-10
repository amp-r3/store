import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@/shared/model';
import { selectUser } from '@/entities/session';
import { useHaptics } from '@/shared/lib/hooks';
import { DeliveryOptions, PaymentOptions } from '@/entities/order';
import { CheckoutFormValues, checkoutMasterSchema } from './checkoutMasterSchema';

export const useCheckoutForm = () => {
  const user = useAppSelector(selectUser);
  const { light } = useHaptics();

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutMasterSchema),
    mode: 'onTouched',
    defaultValues: {
      paymentMethodId: '',
      deliveryMethodId: '',
      firstName: user?.firstName ?? undefined,
      lastName: user?.lastName ?? undefined,
      email: user?.email ?? undefined,
    },
  });

  const { setValue } = methods;

  const applyDeliverySelection = useCallback(
    (id: string, code: DeliveryOptions) => {
      setValue('deliveryMethodId', id, { shouldValidate: true });
      setValue('deliveryMethodCode', code, { shouldValidate: true });
    },
    [setValue],
  );

  const applyPaymentSelection = useCallback(
    (id: string, code: PaymentOptions) => {
      setValue('paymentMethodId', id, { shouldValidate: true });
      setValue('paymentMethodCode', code, { shouldValidate: true });
    },
    [setValue],
  );

  const selectDelivery = useCallback(
    (id: string, code: DeliveryOptions) => {
      applyDeliverySelection(id, code);
      light();
    },
    [applyDeliverySelection, light],
  );

  const selectPayment = useCallback(
    (id: string, code: PaymentOptions) => {
      applyPaymentSelection(id, code);
      light();
    },
    [applyPaymentSelection, light],
  );

  return { methods, selectDelivery, selectPayment, applyPaymentSelection };
};
