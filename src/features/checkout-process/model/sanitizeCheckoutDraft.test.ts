import { describe, it, expect } from 'vitest';
import { sanitizeCheckoutDraft } from './sanitizeCheckoutDraft';
import { makeCheckoutDraft, makeDeliveryMethod, makePaymentMethod } from '@test/fixtures';

describe('sanitizeCheckoutDraft', () => {
  it('keeps a draft whose delivery/payment ids still resolve against the active method lists', () => {
    const delivery = makeDeliveryMethod();
    const payment = makePaymentMethod();
    const draft = makeCheckoutDraft({
      deliveryMethodId: delivery.id,
      deliveryMethodCode: delivery.code,
      paymentMethodId: payment.id,
      paymentMethodCode: payment.code,
    });

    const result = sanitizeCheckoutDraft(draft, [delivery], [payment]);

    expect(result.deliveryMethodId).toBe(delivery.id);
    expect(result.deliveryMethodCode).toBe(delivery.code);
    expect(result.paymentMethodId).toBe(payment.id);
    expect(result.paymentMethodCode).toBe(payment.code);
  });

  // A deactivated/removed delivery method must not silently survive the
  // restore into the create_order RPC call and fail there instead.
  it('blanks the delivery id/code when the draft references a method no longer in the active list', () => {
    const staleDelivery = makeDeliveryMethod({ id: 'stale-delivery' });
    const currentDelivery = makeDeliveryMethod();
    const payment = makePaymentMethod();
    const draft = makeCheckoutDraft({
      deliveryMethodId: staleDelivery.id,
      deliveryMethodCode: staleDelivery.code,
      paymentMethodId: payment.id,
      paymentMethodCode: payment.code,
    });

    const result = sanitizeCheckoutDraft(draft, [currentDelivery], [payment]);

    expect(result.deliveryMethodId).toBe('');
    expect(result.deliveryMethodCode).toBeUndefined();
  });

  it('blanks the payment id/code when the draft references a method no longer in the active list', () => {
    const delivery = makeDeliveryMethod();
    const stalePayment = makePaymentMethod({ id: 'stale-payment' });
    const currentPayment = makePaymentMethod();
    const draft = makeCheckoutDraft({
      deliveryMethodId: delivery.id,
      deliveryMethodCode: delivery.code,
      paymentMethodId: stalePayment.id,
      paymentMethodCode: stalePayment.code,
    });

    const result = sanitizeCheckoutDraft(draft, [delivery], [currentPayment]);

    expect(result.paymentMethodId).toBe('');
    expect(result.paymentMethodCode).toBeUndefined();
  });

  it('blanks a delivery id that is present but empty', () => {
    const payment = makePaymentMethod();
    const draft = makeCheckoutDraft({
      deliveryMethodId: '',
      paymentMethodId: payment.id,
      paymentMethodCode: payment.code,
    });

    const result = sanitizeCheckoutDraft(draft, [makeDeliveryMethod()], [payment]);

    expect(result.deliveryMethodId).toBe('');
  });

  it('preserves every other field of the draft untouched', () => {
    const delivery = makeDeliveryMethod();
    const payment = makePaymentMethod();
    const draft = makeCheckoutDraft({
      firstName: 'Ada',
      deliveryMethodId: delivery.id,
      deliveryMethodCode: delivery.code,
      paymentMethodId: payment.id,
      paymentMethodCode: payment.code,
    });

    const result = sanitizeCheckoutDraft(draft, [delivery], [payment]);

    expect(result.firstName).toBe('Ada');
    expect(result.email).toBe(draft.email);
  });
});
