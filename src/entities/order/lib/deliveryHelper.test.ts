import { describe, it, expect } from 'vitest';
import {
  isDeliveryFree,
  remainingForFreeDelivery,
  pickFreeShippingThreshold,
} from './deliveryHelper';
import { DeliveryMethod } from '@/entities/order/model/types';

const method = (freeFromPrice: number | null, overrides: Partial<DeliveryMethod> = {}) =>
  ({
    id: 'm1',
    code: 'standard',
    label: 'Standard',
    price: 10,
    duration: '3-5d',
    isActive: true,
    freeFromPrice,
    ...overrides,
  }) as DeliveryMethod;

describe('isDeliveryFree', () => {
  it('is false for a null/undefined method', () => {
    expect(isDeliveryFree(null, 100)).toBe(false);
    expect(isDeliveryFree(undefined, 100)).toBe(false);
  });

  it('is false when freeFromPrice is null', () => {
    expect(isDeliveryFree(method(null), 1000)).toBe(false);
  });

  it('is false when freeFromPrice is 0 (a zero threshold is not "always free")', () => {
    expect(isDeliveryFree(method(0), 1000)).toBe(false);
  });

  it('is false below the threshold', () => {
    expect(isDeliveryFree(method(100), 99)).toBe(false);
  });

  it('is true exactly at the threshold', () => {
    expect(isDeliveryFree(method(100), 100)).toBe(true);
  });

  it('is true above the threshold', () => {
    expect(isDeliveryFree(method(100), 150)).toBe(true);
  });
});

describe('remainingForFreeDelivery', () => {
  it('is 0 for a null/undefined method', () => {
    expect(remainingForFreeDelivery(null, 50)).toBe(0);
  });

  it('is 0 when freeFromPrice is null or <= 0', () => {
    expect(remainingForFreeDelivery(method(null), 50)).toBe(0);
    expect(remainingForFreeDelivery(method(0), 50)).toBe(0);
  });

  it('computes the remaining amount below the threshold', () => {
    expect(remainingForFreeDelivery(method(100), 60)).toBe(40);
  });

  it('floors at 0 once the threshold is met or exceeded', () => {
    expect(remainingForFreeDelivery(method(100), 100)).toBe(0);
    expect(remainingForFreeDelivery(method(100), 150)).toBe(0);
  });
});

describe('pickFreeShippingThreshold', () => {
  it('is null for an empty/missing list', () => {
    expect(pickFreeShippingThreshold([])).toBeNull();
    expect(pickFreeShippingThreshold(undefined)).toBeNull();
    expect(pickFreeShippingThreshold(null)).toBeNull();
  });

  it('is null when no method in the list carries a threshold', () => {
    expect(pickFreeShippingThreshold([method(null), method(0)])).toBeNull();
  });

  // This is the FIRST method with a threshold in the list, not the
  // selected/lowest one — a caller that treats it as "the" active
  // threshold for a different, already-selected method can disagree with
  // isDeliveryFree/remainingForFreeDelivery evaluated against that
  // selection (see useCheckoutDelivery.ts's comment on this function).
  it('returns the first threshold found, ignoring a later, different one', () => {
    const standard = method(100, { id: 'standard' });
    const express = method(200, { id: 'express' });
    expect(pickFreeShippingThreshold([standard, express])).toBe(100);
    expect(pickFreeShippingThreshold([express, standard])).toBe(200);
  });

  it('skips a leading method with no threshold to find one further in the list', () => {
    expect(pickFreeShippingThreshold([method(null), method(0), method(150)])).toBe(150);
  });
});
