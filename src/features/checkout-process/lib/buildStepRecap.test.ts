import { describe, it, expect, vi } from 'vitest';
import { buildStepRecap } from './buildStepRecap';
import { makeDeliveryMethod, makePaymentMethod } from '@test/fixtures';
import { PaymentOptions } from '@/entities/order';

// buildStepRecap.ts imports PAYMENT_CONFIG from @/entities/order's barrel as
// a runtime value (not just a type), so importing this module in the node
// `unit` project pulls in orderApi.ts -> @/shared/api/revalidate ('use
// server', importing the build-time-only 'server-only' package). The
// component project's vitest.setup.ts mocks this globally; this file mocks
// it locally instead of moving to .test.tsx, since nothing here needs jsdom.
vi.mock('@/shared/api/revalidate', () => ({
  revalidateProduct: vi.fn(),
  revalidateProducts: vi.fn(),
  revalidateStorefront: vi.fn(),
}));

const emptyValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  housenumber: '',
  city: '',
  postcode: '',
};

describe('buildStepRecap — contacts', () => {
  it('joins name and contact info into two lines', () => {
    const result = buildStepRecap({
      step: 'contacts',
      values: {
        ...emptyValues,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'a@b.co',
        phone: '+123',
      },
      selectedDelivery: null,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual(['Ada Lovelace', 'a@b.co · +123']);
  });

  it('drops a missing field from its line rather than leaving a stray separator', () => {
    const result = buildStepRecap({
      step: 'contacts',
      values: { ...emptyValues, firstName: 'Ada', email: 'a@b.co' },
      selectedDelivery: null,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual(['Ada', 'a@b.co']);
  });

  it('returns an empty array when nothing has been entered yet', () => {
    const result = buildStepRecap({
      step: 'contacts',
      values: emptyValues,
      selectedDelivery: null,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual([]);
  });
});

describe('buildStepRecap — delivery', () => {
  it('returns an empty array when no delivery method is selected', () => {
    const result = buildStepRecap({
      step: 'delivery',
      values: emptyValues,
      selectedDelivery: null,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual([]);
  });

  it('shows only the method line for pickup, even with address fields filled', () => {
    const delivery = makeDeliveryMethod({ label: 'Standard', duration: '3-5 days' });
    const result = buildStepRecap({
      step: 'delivery',
      values: { ...emptyValues, street: 'Main St', city: 'NYC' },
      selectedDelivery: delivery,
      selectedPayment: null,
      isShippingRequired: false,
    });

    expect(result).toEqual(['Standard · 3-5 days']);
  });

  it('shows the method line and the joined address when shipping is required', () => {
    const delivery = makeDeliveryMethod({ label: 'Standard', duration: '3-5 days' });
    const result = buildStepRecap({
      step: 'delivery',
      values: {
        ...emptyValues,
        street: 'Main St',
        housenumber: '5',
        city: 'NYC',
        postcode: '10001',
      },
      selectedDelivery: delivery,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual(['Standard · 3-5 days', 'Main St 5, NYC, 10001']);
  });

  it('gracefully joins a partially-filled address (housenumber-only street)', () => {
    const delivery = makeDeliveryMethod({ label: 'Standard', duration: '3-5 days' });
    const result = buildStepRecap({
      step: 'delivery',
      values: { ...emptyValues, housenumber: '5' },
      selectedDelivery: delivery,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual(['Standard · 3-5 days', '5']);
  });
});

describe('buildStepRecap — payment', () => {
  it('returns an empty array when no payment method is selected', () => {
    const result = buildStepRecap({
      step: 'payment',
      values: emptyValues,
      selectedDelivery: null,
      selectedPayment: null,
      isShippingRequired: true,
    });

    expect(result).toEqual([]);
  });

  it("uses PAYMENT_CONFIG's label when the payment method's code matches a known config entry", () => {
    const payment = makePaymentMethod({ code: 'cash_on_delivery', name: 'DB Row Name' });
    const result = buildStepRecap({
      step: 'payment',
      values: emptyValues,
      selectedDelivery: null,
      selectedPayment: payment,
      isShippingRequired: true,
    });

    expect(result).toEqual(['Upon delivery']);
  });

  // Defensive fallback for config drift: a code the DB returns but
  // PAYMENT_CONFIG no longer lists still renders something, using the raw
  // DB name instead of silently rendering nothing.
  it("falls back to the payment method's raw name when its code has no PAYMENT_CONFIG entry", () => {
    const payment = makePaymentMethod({
      code: 'not-a-real-code' as PaymentOptions,
      name: 'Bank Transfer',
    });
    const result = buildStepRecap({
      step: 'payment',
      values: emptyValues,
      selectedDelivery: null,
      selectedPayment: payment,
      isShippingRequired: true,
    });

    expect(result).toEqual(['Bank Transfer']);
  });
});
