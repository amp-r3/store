import { describe, it, expect } from 'vitest';
import { buildCreateOrderPayload } from './buildCreateOrderPayload';
import { makeCheckoutDraft } from '@test/fixtures';
import { CheckoutFormValues } from './checkoutMasterSchema';
import { CartProduct } from '@/entities/cart';

const formData = makeCheckoutDraft() as CheckoutFormValues;
const items: CartProduct[] = [
  { productId: 1, sizeId: 10, quantity: 2 },
  { productId: 2, sizeId: 20, quantity: 1 },
];

describe('buildCreateOrderPayload', () => {
  it('maps contact fields and the real address when shipping is required', () => {
    const payload = buildCreateOrderPayload(formData, items, true);

    expect(payload.p_shipping_address).toEqual({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      street: formData.street,
      housenumber: formData.housenumber,
      postcode: formData.postcode,
    });
  });

  // Pickup orders send the literal 'N/A' for every address field, since the
  // schema makes them optional for pickup — this is what keeps an
  // undefined field from reaching the create_order RPC.
  it('substitutes "N/A" for every address field when shipping is not required (pickup)', () => {
    const payload = buildCreateOrderPayload(formData, items, false);

    expect(payload.p_shipping_address).toEqual({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      country: 'N/A',
      city: 'N/A',
      street: 'N/A',
      housenumber: 'N/A',
      postcode: 'N/A',
    });
  });

  it('carries the payment/delivery method ids through unchanged', () => {
    const payload = buildCreateOrderPayload(formData, items, true);

    expect(payload.p_payment_method_id).toBe(formData.paymentMethodId);
    expect(payload.p_delivery_method_id).toBe(formData.deliveryMethodId);
  });

  it('maps checkout items to the RPC item shape, dropping price data', () => {
    const payload = buildCreateOrderPayload(formData, items, true);

    expect(payload.p_items).toEqual([
      { product_id: 1, size_id: 10, quantity: 2 },
      { product_id: 2, size_id: 20, quantity: 1 },
    ]);
  });

  it('produces an empty item list for an empty cart', () => {
    const payload = buildCreateOrderPayload(formData, [], true);

    expect(payload.p_items).toEqual([]);
  });
});
