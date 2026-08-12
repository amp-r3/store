import { describe, it, expect } from 'vitest';
import { CHECKOUT_STEP_SCHEMAS, checkoutMasterSchema } from './checkoutMasterSchema';

const VALID_UUID = '11111111-1111-1111-1111-111111111111';

describe('CHECKOUT_STEP_SCHEMAS.contacts', () => {
  const base = { firstName: 'Jo', lastName: 'Do', email: 'a@b.co', phone: '+1234567' };

  it('accepts a valid contact payload', () => {
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse(base).success).toBe(true);
  });

  it('rejects names shorter than 2 characters', () => {
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, firstName: 'J' }).success).toBe(
      false,
    );
  });

  it('email regex accepts a minimal valid address, rejects missing domain dot / spaces', () => {
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, email: 'a@b.co' }).success).toBe(
      true,
    );
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, email: 'a@b' }).success).toBe(false);
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, email: 'a b@c.co' }).success).toBe(
      false,
    );
  });

  it('phone requires 7-15 digits, an optional leading +, no separators', () => {
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, phone: '123456' }).success).toBe(
      false,
    ); // 6 digits
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, phone: '1234567' }).success).toBe(
      true,
    ); // 7 digits
    expect(
      CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, phone: '123456789012345' }).success,
    ).toBe(true); // 15 digits
    expect(
      CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, phone: '1234567890123456' }).success,
    ).toBe(false); // 16 digits
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, phone: '+1234567' }).success).toBe(
      true,
    );
    expect(CHECKOUT_STEP_SCHEMAS.contacts.safeParse({ ...base, phone: '123-4567' }).success).toBe(
      false,
    );
  });
});

describe('CHECKOUT_STEP_SCHEMAS.delivery', () => {
  const base = { deliveryMethodId: VALID_UUID };

  it('rejects a non-UUID deliveryMethodId', () => {
    expect(
      CHECKOUT_STEP_SCHEMAS.delivery.safeParse({ deliveryMethodId: 'not-a-uuid' }).success,
    ).toBe(false);
  });

  it('pickup skips every address field', () => {
    const result = CHECKOUT_STEP_SCHEMAS.delivery.safeParse({
      ...base,
      deliveryMethodCode: 'pickup',
    });
    expect(result.success).toBe(true);
  });

  it('standard requires country/city/street/housenumber/postcode', () => {
    const result = CHECKOUT_STEP_SCHEMAS.delivery.safeParse({
      ...base,
      deliveryMethodCode: 'standard',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(['country', 'city', 'street', 'housenumber', 'postcode']),
      );
    }
  });

  it('standard with a complete address passes', () => {
    const result = CHECKOUT_STEP_SCHEMAS.delivery.safeParse({
      ...base,
      deliveryMethodCode: 'standard',
      country: 'Germany',
      city: 'Berlin',
      street: 'Mainstr',
      housenumber: '1',
      postcode: '10115',
    });
    expect(result.success).toBe(true);
  });

  it('whitespace-only address fields fail the trimmed min-length checks', () => {
    const result = CHECKOUT_STEP_SCHEMAS.delivery.safeParse({
      ...base,
      deliveryMethodCode: 'standard',
      country: '  ',
      city: '  ',
      street: '  ',
      housenumber: ' ',
      postcode: '  ',
    });
    expect(result.success).toBe(false);
  });

  // deliveryMethodCode is `.optional()`, but an omitted code must NOT be
  // treated the same as pickup — the address is still required.
  it('with deliveryMethodCode omitted, address validation still applies', () => {
    const result = CHECKOUT_STEP_SCHEMAS.delivery.safeParse(base);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(['country', 'city', 'street', 'housenumber', 'postcode']),
      );
    }
  });

  it('with deliveryMethodCode omitted, a complete address still passes', () => {
    const result = CHECKOUT_STEP_SCHEMAS.delivery.safeParse({
      ...base,
      country: 'Germany',
      city: 'Berlin',
      street: 'Mainstr',
      housenumber: '1',
      postcode: '10115',
    });
    expect(result.success).toBe(true);
  });
});

describe('CHECKOUT_STEP_SCHEMAS.payment', () => {
  it('requires a valid UUID paymentMethodId', () => {
    expect(CHECKOUT_STEP_SCHEMAS.payment.safeParse({ paymentMethodId: VALID_UUID }).success).toBe(
      true,
    );
    expect(CHECKOUT_STEP_SCHEMAS.payment.safeParse({ paymentMethodId: 'nope' }).success).toBe(
      false,
    );
  });
});

describe('checkoutMasterSchema', () => {
  it('composes all three step shapes and re-applies the address refine', () => {
    const full = {
      firstName: 'Jo',
      lastName: 'Do',
      email: 'a@b.co',
      phone: '+1234567',
      deliveryMethodId: VALID_UUID,
      deliveryMethodCode: 'pickup' as const,
      paymentMethodId: VALID_UUID,
    };
    expect(checkoutMasterSchema.safeParse(full).success).toBe(true);

    const missingAddress = { ...full, deliveryMethodCode: 'standard' as const };
    expect(checkoutMasterSchema.safeParse(missingAddress).success).toBe(false);
  });
});
