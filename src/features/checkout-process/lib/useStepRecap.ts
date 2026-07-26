import { useFormContext, useWatch } from 'react-hook-form';
import { PAYMENT_CONFIG } from '@/entities/order';
import { CheckoutFormValues } from '../model/checkoutMasterSchema';
import { useCheckoutContext } from '../model/CheckoutContext';
import { StepType } from '../model/types';

const RECAP_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'street', 'housenumber', 'city', 'postcode'] as const;

// Reads the live form values (not just the submitted draft) so a collapsed,
// already-visited section shows what the user actually typed right now.
export const useStepRecap = (step: StepType): string[] => {
  const { control } = useFormContext<CheckoutFormValues>();
  const [firstName, lastName, email, phone, street, housenumber, city, postcode] = useWatch({
    control,
    name: RECAP_FIELDS,
  });
  const { selectedDelivery, selectedPayment, isShippingRequired } = useCheckoutContext();

  if (step === 'contacts') {
    const name = [firstName, lastName].filter(Boolean).join(' ');
    const contact = [email, phone].filter(Boolean).join(' · ');
    return [name, contact].filter(Boolean);
  }

  if (step === 'delivery') {
    if (!selectedDelivery) return [];
    const method = [selectedDelivery.label, selectedDelivery.duration].filter(Boolean).join(' · ');
    if (!isShippingRequired) return [method];
    const address = [[street, housenumber].filter(Boolean).join(' '), city, postcode]
      .filter(Boolean)
      .join(', ');
    return [method, address].filter(Boolean);
  }

  if (step === 'payment') {
    if (!selectedPayment) return [];
    const info = PAYMENT_CONFIG.find((m) => m.id === selectedPayment.code);
    return [info?.label ?? selectedPayment.name];
  }

  return [];
};
