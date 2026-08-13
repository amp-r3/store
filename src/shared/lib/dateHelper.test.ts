import { describe, it, expect } from 'vitest';
import { formatDate } from './dateHelper';

// vitest.config.ts pins test.env.TZ to 'UTC' specifically so these
// assertions are deterministic — a date-only string parses as UTC midnight,
// so an unpinned machine timezone west of UTC renders the previous day
// (verified: 'Mar 5, 2024' under UTC, 'Mar 4, 2024' under America/New_York).
describe('formatDate', () => {
  it('formats a date-only string in the "medium" variant (the default) as UTC midnight', () => {
    expect(formatDate('2024-03-05')).toBe('Mar 5, 2024');
  });

  it('formats the "compact" variant without a year', () => {
    expect(formatDate('2024-03-05', 'compact')).toBe('Mar 5');
  });

  it('formats the "full" variant with hour/minute', () => {
    expect(formatDate('2024-03-05T14:30:00Z', 'full')).toBe('Mar 5, 2024, 02:30 PM');
  });

  it('renders "Invalid Date" to the user rather than throwing, for unparseable input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
    expect(formatDate('')).toBe('Invalid Date');
  });
});
