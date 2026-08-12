import { describe, it, expect } from 'vitest';
import { computeMaxReachedIndex } from './computeMaxReachedIndex';
import { CheckoutFormValues } from './checkoutMasterSchema';

const VALID_UUID = '11111111-1111-1111-1111-111111111111';

const contactsValid: Partial<CheckoutFormValues> = {
  firstName: 'Jo',
  lastName: 'Do',
  email: 'a@b.co',
  phone: '+1234567',
};

const deliveryValid: Partial<CheckoutFormValues> = {
  deliveryMethodId: VALID_UUID,
  deliveryMethodCode: 'pickup',
};

const paymentValid: Partial<CheckoutFormValues> = {
  paymentMethodId: VALID_UUID,
};

describe('computeMaxReachedIndex', () => {
  it('returns 0 for a null draft', () => {
    expect(computeMaxReachedIndex(null)).toBe(0);
  });

  it('returns 0 when even the first step (contacts) fails', () => {
    expect(computeMaxReachedIndex({})).toBe(0);
  });

  it('returns 1 once contacts alone is valid', () => {
    expect(computeMaxReachedIndex({ ...contactsValid })).toBe(1);
  });

  it('returns 2 once contacts and delivery are both valid', () => {
    expect(computeMaxReachedIndex({ ...contactsValid, ...deliveryValid })).toBe(2);
  });

  it('clamps at STEPS_ORDER.length - 1 when the whole draft is complete', () => {
    const full = { ...contactsValid, ...deliveryValid, ...paymentValid };
    expect(computeMaxReachedIndex(full)).toBe(2);
  });

  // The loop breaks on the FIRST invalid step, so a bad first step re-locks
  // checkout back to 0 even if later steps' data happens to validate.
  it('breaks at the first invalid step even if later steps would validate', () => {
    const brokenFirstStep = { ...deliveryValid, ...paymentValid };
    expect(computeMaxReachedIndex(brokenFirstStep)).toBe(0);
  });
});
