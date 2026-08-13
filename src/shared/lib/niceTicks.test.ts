import { describe, it, expect } from 'vitest';
import { niceTicks } from './niceTicks';

describe('niceTicks', () => {
  it('returns [0] for a zero or negative max', () => {
    expect(niceTicks(0, 4)).toEqual([0]);
    expect(niceTicks(-5, 4)).toEqual([0]);
  });

  it('rounds up to a clean 1/2/5×10^n step, not the raw data max', () => {
    expect(niceTicks(847, 4)).toEqual([0, 500, 1000]);
    expect(niceTicks(250, 4)).toEqual([0, 100, 200, 300]);
  });

  // Both chart call sites (BarChart, LineChart) pass Y_TICK_COUNT = 4 — the
  // rest of the module assumes the returned array reflects the requested
  // count, but the residual ladder (>5/>2/>1) systematically overshoots the
  // step and undershoots the count for a residual of exactly 2.5.
  it('does not honor the requested tickCount — a residual of 2.5 rounds the step up to 5×magnitude', () => {
    expect(niceTicks(100, 5)).toEqual([0, 50, 100]); // 3 ticks, not 5
    expect(niceTicks(100, 4)).toEqual([0, 50, 100]);
  });

  it('returns an empty array (not [0]) for NaN or Infinity — the maxValue <= 0 guard does not catch either', () => {
    expect(niceTicks(NaN, 4)).toEqual([]);
    expect(niceTicks(Infinity, 4)).toEqual([]);
  });

  it('collapses to duplicate-looking ticks for a sub-cent range (2-decimal rounding)', () => {
    expect(niceTicks(1e-8, 5)).toEqual([0, 0, 0]);
  });

  it('clamps tickCount <= 1 to a single step via Math.max(tickCount - 1, 1)', () => {
    expect(niceTicks(10, 1)).toEqual([0, 10]);
    expect(niceTicks(10, 0)).toEqual([0, 10]);
  });
});
