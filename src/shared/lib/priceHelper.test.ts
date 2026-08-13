import { describe, it, expect } from 'vitest';
import { formatPrice, formatPriceCompact } from './priceHelper';

describe('formatPrice', () => {
  it('formats a positive amount as USD currency with 2 decimal places', () => {
    expect(formatPrice(1234.5)).toBe('$1,234.50');
  });

  it('formats a negative amount with a leading minus before the currency symbol', () => {
    expect(formatPrice(-12.3)).toBe('-$12.30');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('rounds a sub-cent value up to the nearest cent', () => {
    expect(formatPrice(0.005)).toBe('$0.01');
  });

  // No NaN/Infinity guard — a caller passing either renders this verbatim
  // to the user rather than throwing.
  it('renders NaN/Infinity verbatim rather than throwing', () => {
    expect(formatPrice(NaN)).toBe('$NaN');
    expect(formatPrice(Infinity)).toBe('$∞');
  });
});

describe('formatPriceCompact', () => {
  it('abbreviates thousands with a "K" suffix', () => {
    expect(formatPriceCompact(1234.5)).toBe('$1.2K');
  });

  it('abbreviates millions with an "M" suffix', () => {
    expect(formatPriceCompact(1234567)).toBe('$1.2M');
  });

  it('does not abbreviate a value under 1,000', () => {
    expect(formatPriceCompact(0)).toBe('$0');
    expect(formatPriceCompact(-12.3)).toBe('-$12.3');
  });
});
