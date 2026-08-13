import { DeliveryMethod, PaymentMethod, PAYMENT_CONFIG } from '@/entities/order';
import { CheckoutFormValues } from '../model/checkoutMasterSchema';
import { StepType } from '../model/types';

type StepRecapFields = Pick<
  CheckoutFormValues,
  'firstName' | 'lastName' | 'email' | 'phone' | 'street' | 'housenumber' | 'city' | 'postcode'
>;

interface BuildStepRecapParams {
  step: StepType;
  values: StepRecapFields;
  selectedDelivery: DeliveryMethod | null | undefined;
  selectedPayment: PaymentMethod | null | undefined;
  isShippingRequired: boolean;
}

export const buildStepRecap = ({
  step,
  values,
  selectedDelivery,
  selectedPayment,
  isShippingRequired,
}: BuildStepRecapParams): string[] => {
  const { firstName, lastName, email, phone, street, housenumber, city, postcode } = values;

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
