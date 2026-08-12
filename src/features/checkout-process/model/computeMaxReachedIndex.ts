import { STEPS_ORDER } from './types';
import { CHECKOUT_STEP_SCHEMAS, CheckoutFormValues } from './checkoutMasterSchema';

// A step is "reached" once every earlier step's own data validates against the
// saved draft, so a reload with a complete draft keeps the whole trail unlocked.
export const computeMaxReachedIndex = (draft: Partial<CheckoutFormValues> | null): number => {
  if (!draft) return 0;

  let maxIndex = 0;
  for (const step of STEPS_ORDER) {
    if (!CHECKOUT_STEP_SCHEMAS[step].safeParse(draft).success) break;
    maxIndex = Math.min(STEPS_ORDER.indexOf(step) + 1, STEPS_ORDER.length - 1);
  }
  return maxIndex;
};
