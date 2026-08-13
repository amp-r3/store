import { describe, it, expect } from 'vitest';
import { isRangeError } from './isRangeError';

describe('isRangeError', () => {
  it('is true for a PGRST103 status', () => {
    expect(isRangeError({ status: 'PGRST103' })).toBe(true);
  });

  it('is true for a 416 status', () => {
    expect(isRangeError({ status: 416 })).toBe(true);
  });

  it('is false for any other status', () => {
    expect(isRangeError({ status: 500 })).toBe(false);
    expect(isRangeError({ status: 404 })).toBe(false);
  });

  it('is false for null/undefined/non-object input', () => {
    expect(isRangeError(null)).toBe(false);
    expect(isRangeError(undefined)).toBe(false);
    expect(isRangeError('PGRST103')).toBe(false);
    expect(isRangeError(416)).toBe(false);
  });

  it('is false for an object with no status field', () => {
    expect(isRangeError({ message: 'oops' })).toBe(false);
  });
});
