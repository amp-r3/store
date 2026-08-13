import { useCallback, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { useGetLastShippingAddressQuery, DeliveryMethod, PaymentMethod } from '@/entities/order';
import { saveCheckoutDraft } from './checkoutSlice';
import { selectCheckoutDraft } from './checkoutSelectors';
import { CheckoutFormValues } from './checkoutMasterSchema';
import { sanitizeCheckoutDraft } from './sanitizeCheckoutDraft';

const DRAFT_SAVE_DELAY = 500;

interface UseCheckoutDraftParams {
  methods: UseFormReturn<CheckoutFormValues>;
  deliveryMethods?: DeliveryMethod[];
  paymentMethods?: PaymentMethod[];
}

export const useCheckoutDraft = ({
  methods,
  deliveryMethods,
  paymentMethods,
}: UseCheckoutDraftParams) => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectCheckoutDraft);
  const hadDraftOnMountRef = useRef(!!draft);
  const hasRestoredRef = useRef(false);

  const { watch, reset, getValues } = methods;

  const { data: lastAddress } = useGetLastShippingAddressQuery(undefined, {
    skip: hadDraftOnMountRef.current,
  });

  // Restore the draft once its delivery/payment method ids can be checked
  // against the currently active methods — a deactivated method must not
  // silently survive into the RPC call and fail there instead.
  useEffect(() => {
    if (hasRestoredRef.current || !draft) return;
    if (!deliveryMethods || !paymentMethods) return;

    hasRestoredRef.current = true;

    reset({ ...getValues(), ...sanitizeCheckoutDraft(draft, deliveryMethods, paymentMethods) });
  }, [draft, deliveryMethods, paymentMethods, reset, getValues]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const subscription = watch((values) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(saveCheckoutDraft(values as Partial<CheckoutFormValues>));
      }, DRAFT_SAVE_DELAY);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [watch, dispatch]);

  const applyPreviousAddress = useCallback(() => {
    if (!lastAddress) return;
    reset({ ...getValues(), ...lastAddress });
  }, [lastAddress, reset, getValues]);

  return {
    applyPreviousAddress,
    hasPreviousAddress: !!lastAddress,
    showPreviousAddressChip: !hadDraftOnMountRef.current,
  };
};
