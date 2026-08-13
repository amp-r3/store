import { describe, it, expect } from 'vitest';
import { buildRatingStats } from './reviewsHelper';

describe('buildRatingStats', () => {
  it('always returns 5 buckets, in 5 -> 1 order, regardless of input order', () => {
    const stats = buildRatingStats([
      { rating: 2, review_count: 1 },
      { rating: 5, review_count: 3 },
    ]);

    expect(stats.distribution.map((bucket) => bucket.stars)).toEqual([5, 4, 3, 2, 1]);
  });

  it('missing star ratings become count: 0, not an absent bucket', () => {
    const stats = buildRatingStats([{ rating: 5, review_count: 3 }]);

    expect(stats.distribution).toEqual([
      { stars: 5, count: 3, percentage: 100 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ]);
  });

  it('sums review_count across all rows for total', () => {
    const stats = buildRatingStats([
      { rating: 5, review_count: 3 },
      { rating: 4, review_count: 2 },
      { rating: 1, review_count: 1 },
    ]);

    expect(stats.total).toBe(6);
  });

  it('percentage is 0, not NaN, when total is 0', () => {
    const stats = buildRatingStats([]);

    expect(stats.total).toBe(0);
    expect(stats.distribution.every((bucket) => bucket.percentage === 0)).toBe(true);
  });

  it('percentages are Math.round-ed', () => {
    const stats = buildRatingStats([
      { rating: 5, review_count: 1 },
      { rating: 4, review_count: 2 },
    ]);

    // 1/3 -> 33.33... rounds to 33; 2/3 -> 66.66... rounds to 67.
    const five = stats.distribution.find((bucket) => bucket.stars === 5);
    const four = stats.distribution.find((bucket) => bucket.stars === 4);
    expect(five?.percentage).toBe(33);
    expect(four?.percentage).toBe(67);
  });
});
