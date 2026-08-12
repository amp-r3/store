import { describe, it, expect } from 'vitest';
import { calculateCartTotals, calculateOrderTotals } from './cartHelper';
import { CartItemDetails } from '@/entities/cart/model/types';

const line = (basePrice: number, price: number, quantity: number) =>
  ({ basePrice, price, quantity }) as CartItemDetails;

describe('calculateCartTotals', () => {
  it('returns all zeros for an empty cart', () => {
    expect(calculateCartTotals([], null)).toEqual({
      subtotal: 0,
      total: 0,
      discountAmount: 0,
      discountPercent: 0,
      shippingProgress: 0,
      remainingForFreeShipping: 0,
    });
  });

  it('sums basePrice*qty for subtotal and price*qty for total', () => {
    const items = [line(100, 80, 2), line(50, 50, 1)];
    const result = calculateCartTotals(items, null);
    expect(result.subtotal).toBe(250);
    expect(result.total).toBe(210);
    expect(result.discountAmount).toBe(40);
  });

  it('rounds float accumulation to 2dp', () => {
    const items = [line(0.1, 0.1, 1), line(0.2, 0.2, 1)];
    const result = calculateCartTotals(items, null);
    expect(result.subtotal).toBe(0.3);
    expect(result.total).toBe(0.3);
  });

  it('discountPercent is Math.round-ed', () => {
    // 10 -> 9.99 is a 0.1% discount, rounds to 0
    const items = [line(10, 9.99, 1)];
    const result = calculateCartTotals(items, null);
    expect(result.discountPercent).toBe(0);
  });

  it('discountPercent is 0 when subtotal is 0 (avoids division by zero)', () => {
    const items = [line(0, 0, 1)];
    const result = calculateCartTotals(items, null);
    expect(result.discountPercent).toBe(0);
  });

  it('threshold null leaves shipping progress and remaining at 0', () => {
    const result = calculateCartTotals([line(100, 100, 1)], null);
    expect(result.shippingProgress).toBe(0);
    expect(result.remainingForFreeShipping).toBe(0);
  });

  it('clamps shippingProgress at 100 once total meets the threshold', () => {
    const result = calculateCartTotals([line(200, 200, 1)], 100);
    expect(result.shippingProgress).toBe(100);
    expect(result.remainingForFreeShipping).toBe(0);
  });

  it('computes partial progress and remaining below the threshold', () => {
    const result = calculateCartTotals([line(40, 40, 1)], 100);
    expect(result.shippingProgress).toBe(40);
    expect(result.remainingForFreeShipping).toBe(60);
  });

  // Pin: the `freeShippingThreshold === 0` branch is unreachable in practice —
  // `0 > 0` is false so it never enters the `!== null` arm's `if`, but it IS
  // covered by the separate `else if (freeShippingThreshold === 0)` arm below
  // it. Documenting the actual (reachable) behaviour for threshold 0.
  it('threshold 0 is treated as "always free" (100% progress)', () => {
    const result = calculateCartTotals([line(100, 100, 1)], 0);
    expect(result.shippingProgress).toBe(100);
    expect(result.remainingForFreeShipping).toBe(0);
  });
});

describe('calculateOrderTotals', () => {
  it('is a pass-through when delivery and fees are all zero', () => {
    const result = calculateOrderTotals({
      cartTotal: 100,
      deliveryCost: 0,
      isDeliveryFree: false,
      paymentFeePercentage: 0,
      paymentFeeFixed: 0,
    });
    expect(result).toEqual({
      deliveryCost: 0,
      feePercentage: 0,
      feeFixed: 0,
      feePercentageAmount: 0,
      totalPaymentFee: 0,
      finalTotalPrice: 100,
    });
  });

  it('zeroes delivery cost when isDeliveryFree is true', () => {
    const result = calculateOrderTotals({
      cartTotal: 100,
      deliveryCost: 15,
      isDeliveryFree: true,
      paymentFeePercentage: 0,
      paymentFeeFixed: 0,
    });
    expect(result.deliveryCost).toBe(0);
    expect(result.finalTotalPrice).toBe(100);
  });

  it('applies the percentage fee to cartTotal + delivery, not cart alone', () => {
    const result = calculateOrderTotals({
      cartTotal: 100,
      deliveryCost: 20,
      isDeliveryFree: false,
      paymentFeePercentage: 10,
      paymentFeeFixed: 0,
    });
    // (100 + 20) * 10% = 12, not 100 * 10% = 10
    expect(result.feePercentageAmount).toBe(12);
    expect(result.totalPaymentFee).toBe(12);
    expect(result.finalTotalPrice).toBe(132);
  });

  it('adds the fixed fee on top of the percentage fee', () => {
    const result = calculateOrderTotals({
      cartTotal: 100,
      deliveryCost: 0,
      isDeliveryFree: false,
      paymentFeePercentage: 5,
      paymentFeeFixed: 2.5,
    });
    expect(result.feePercentageAmount).toBe(5);
    expect(result.totalPaymentFee).toBe(7.5);
    expect(result.finalTotalPrice).toBe(107.5);
  });

  it('rounds finalTotalPrice once at the end', () => {
    const result = calculateOrderTotals({
      cartTotal: 19.99,
      deliveryCost: 4.99,
      isDeliveryFree: false,
      paymentFeePercentage: 2.9,
      paymentFeeFixed: 0.3,
    });
    expect(Number.isFinite(result.finalTotalPrice)).toBe(true);
    expect(result.finalTotalPrice).toBe(Math.round(result.finalTotalPrice * 100) / 100);
  });
});
