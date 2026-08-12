import { describe, it, expect } from 'vitest';
import { catalogParamsSchema } from './catalogParamsSchema';
import { sortingOptions } from '@/entities/product/config/sortingOptions';

const parse = (input: Record<string, unknown>) => catalogParamsSchema.parse(input);

describe('catalogParamsSchema — never throws, always falls back', () => {
  it('page: garbage values all fall back to 1', () => {
    for (const bad of ['abc', '-1', '0', '1.5', '', null, undefined]) {
      expect(parse({ page: bad }).page).toBe(1);
    }
  });

  it('page: a valid positive integer string parses through', () => {
    expect(parse({ page: '3' }).page).toBe(3);
  });

  it('sortBy/order: unknown values fall back to null, valid enum values pass', () => {
    expect(parse({ sortBy: 'bogus' }).sortBy).toBeNull();
    expect(parse({ sortBy: 'price' }).sortBy).toBe('price');
    expect(parse({ order: 'bogus' }).order).toBeNull();
    expect(parse({ order: 'asc' }).order).toBe('asc');
  });

  it('category: missing falls back to "all"', () => {
    expect(parse({}).category).toBe('all');
    expect(parse({ category: 'shoes' }).category).toBe('shoes');
  });

  it('deals: only the literal string "true" is truthy', () => {
    expect(parse({ deals: 'true' }).deals).toBe(true);
    expect(parse({ deals: '1' }).deals).toBe(false);
    expect(parse({ deals: 'TRUE' }).deals).toBe(false);
    expect(parse({}).deals).toBe(false);
  });
});

describe('round-trip with sortingOptions', () => {
  it('every (sortBy, order) pair in sortingOptions parses without falling back to null', () => {
    for (const option of sortingOptions) {
      const result = parse({ sortBy: option.sortBy, order: option.order });
      expect(result.sortBy).toBe(option.sortBy);
      expect(result.order).toBe(option.order);
    }
  });
});
