import { describe, it, expect } from 'vitest';
import { calculatePrice } from './calculatePrice';

describe('calculatePrice', () => {
  it('0% discount is a pass-through', () => {
    expect(calculatePrice(100, 0)).toBe(100);
  });

  it('100% discount yields 0', () => {
    expect(calculatePrice(100, 100)).toBe(0);
  });

  it('a typical discount applies the percentage off base price', () => {
    expect(calculatePrice(100, 25)).toBe(75);
    expect(calculatePrice(80, 10)).toBe(72);
  });

  // Documents the JS side of the base_price/discount_percentage generated-
  // column contract this function mirrors — flags any future drift from the
  // Postgres `round(..., 2)` / numeric rounding behaviour.
  it('half-cent rounding cases (JS Math.round, not Postgres numeric rounding)', () => {
    expect(calculatePrice(19.99, 15)).toBe(16.99);
    expect(calculatePrice(0.61, 50)).toBe(0.31);
  });
});
