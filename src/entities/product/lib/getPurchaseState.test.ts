import { describe, it, expect } from 'vitest';
import { getPurchaseState } from './getPurchaseState';
import { ProductSize } from '../model/types';

const size = (id: number, stock: number): ProductSize => ({ id, value: `S${id}`, stock });

describe('getPurchaseState', () => {
  it('a sizeless product (hasSizes: false) is out of stock with currentStock 0', () => {
    const result = getPurchaseState({
      quantity: 0,
      sizes: undefined,
      selectedSizeId: undefined,
      hasSizes: false,
    });
    expect(result.isSizeSelected).toBe(true);
    expect(result.currentStock).toBe(0);
    expect(result.currentInStock).toBe(false);
    expect(result.isOutOfStock).toBe(true);
  });

  it('a selected size reports its own stock', () => {
    const sizes = [size(1, 3), size(2, 0)];
    const result = getPurchaseState({ quantity: 0, sizes, selectedSizeId: 1, hasSizes: true });
    expect(result.isSizeSelected).toBe(true);
    expect(result.currentStock).toBe(3);
    expect(result.currentInStock).toBe(true);
    expect(result.isLowStock).toBe(true);
    expect(result.isOutOfStock).toBe(false);
  });

  // No size chosen yet is not the same as "out of stock" — currentStock is
  // an honest 0 (no single count to report), but currentInStock still
  // reflects real availability across sizes so the "select a size" prompt
  // stays clickable instead of reading as disabled/out-of-stock.
  it('no size selected but some size in stock reports currentStock 0 while staying "in stock"', () => {
    const sizes = [size(1, 3), size(2, 0)];
    const result = getPurchaseState({
      quantity: 0,
      sizes,
      selectedSizeId: undefined,
      hasSizes: true,
    });
    expect(result.isSizeSelected).toBe(false);
    expect(result.currentStock).toBe(0);
    expect(result.currentInStock).toBe(true);
    expect(result.isLowStock).toBe(false);
    expect(result.isOutOfStock).toBe(false);
  });

  it('no size selected and every size out of stock reports out of stock', () => {
    const sizes = [size(1, 0), size(2, 0)];
    const result = getPurchaseState({
      quantity: 0,
      sizes,
      selectedSizeId: undefined,
      hasSizes: true,
    });
    expect(result.currentStock).toBe(0);
    expect(result.currentInStock).toBe(false);
    expect(result.isOutOfStock).toBe(true);
  });

  it('isMaxReached is never true while no size is selected, even at quantity 0', () => {
    const sizes = [size(1, 3), size(2, 0)];
    const result = getPurchaseState({
      quantity: 0,
      sizes,
      selectedSizeId: undefined,
      hasSizes: true,
    });
    expect(result.isMaxReached).toBe(false);
  });

  it('isMaxReached is true at the exact stock boundary', () => {
    const sizes = [size(1, 3)];
    const result = getPurchaseState({ quantity: 3, sizes, selectedSizeId: 1, hasSizes: true });
    expect(result.isMaxReached).toBe(true);
  });

  it('isMaxReached is false below the stock boundary', () => {
    const sizes = [size(1, 3)];
    const result = getPurchaseState({ quantity: 2, sizes, selectedSizeId: 1, hasSizes: true });
    expect(result.isMaxReached).toBe(false);
  });
});
