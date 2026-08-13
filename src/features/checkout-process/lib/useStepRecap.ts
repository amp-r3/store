import { useFormContext, useWatch } from 'react-hook-form';
import { CheckoutFormValues } from '../model/checkoutMasterSchema';
import { useCheckoutContext } from '../model/CheckoutContext';
import { StepType } from '../model/types';
import { buildStepRecap } from './buildStepRecap';

const RECAP_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'street',
  'housenumber',
  'city',
  'postcode',
] as const;

// Reads the live form values (not just the submitted draft) so a collapsed,
// already-visited section shows what the user actually typed right now.
export const useStepRecap = (step: StepType): string[] => {
  const { control } = useFormContext<CheckoutFormValues>();
  const [firstName, lastName, email, phone, street, housenumber, city, postcode] = useWatch({
    control,
    name: RECAP_FIELDS,
  });
  const { selectedDelivery, selectedPayment, isShippingRequired } = useCheckoutContext();

  return buildStepRecap({
    step,
    values: { firstName, lastName, email, phone, street, housenumber, city, postcode },
    selectedDelivery,
    selectedPayment,
    isShippingRequired,
  });
};
