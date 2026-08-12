import { describe, it, expect } from 'vitest';
import { isDeliveryFree, remainingForFreeDelivery } from './deliveryHelper';
import { DeliveryMethod } from '@/entities/order/model/types';

const method = (freeFromPrice: number | null) =>
  ({
    id: 'm1',
    code: 'standard',
    label: 'Standard',
    price: 10,
    duration: '3-5d',
    isActive: true,
    freeFromPrice,
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
