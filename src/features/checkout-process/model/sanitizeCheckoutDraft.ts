import { DeliveryMethod, PaymentMethod } from '@/entities/order';
import { CheckoutFormValues } from './checkoutMasterSchema';

// A deactivated delivery/payment method must not silently survive a draft
// restore into the create_order RPC call and fail there instead — this
// checks the draft's ids against the currently active method lists and
// blanks out anything that no longer resolves.
export const sanitizeCheckoutDraft = (
  draft: Partial<CheckoutFormValues>,
  deliveryMethods: DeliveryMethod[],
  paymentMethods: PaymentMethod[],
): Partial<CheckoutFormValues> => {
  const deliveryValid =
    !!draft.deliveryMethodId && deliveryMethods.some((m) => m.id === draft.deliveryMethodId);
  const paymentValid =
    !!draft.paymentMethodId && paymentMethods.some((m) => m.id === draft.paymentMethodId);

  return {
    ...draft,
    deliveryMethodId: deliveryValid ? draft.deliveryMethodId : '',
    deliveryMethodCode: deliveryValid ? draft.deliveryMethodCode : undefined,
    paymentMethodId: paymentValid ? draft.paymentMethodId : '',
    paymentMethodCode: paymentValid ? draft.paymentMethodCode : undefined,
  };
};
