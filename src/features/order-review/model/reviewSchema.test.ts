import { describe, it, expect } from 'vitest';
import { reviewSchema } from './reviewSchema';

describe('reviewSchema', () => {
  it('rejects a rating of 0', () => {
    const result = reviewSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a rating');
    }
  });

  it('rejects a rating above 5', () => {
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('accepts every rating from 1 to 5', () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(reviewSchema.safeParse({ rating }).success).toBe(true);
    }
  });

  it('treats comment as optional', () => {
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
  });

  it('rejects a comment over 2000 characters', () => {
    const result = reviewSchema.safeParse({ rating: 5, comment: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Comment must be 2000 characters or fewer');
    }
  });

  it('accepts a comment at exactly 2000 characters', () => {
    expect(reviewSchema.safeParse({ rating: 5, comment: 'a'.repeat(2000) }).success).toBe(true);
  });
});
