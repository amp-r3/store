import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  startRouteProgress,
  endRouteProgress,
  resetRouteProgress,
  subscribeRouteProgress,
  getRouteProgressSnapshot,
  getRouteProgressServerSnapshot,
} from './routeProgress';

// Both activeCount and the listeners Set are module-level state shared
// across every test in this file — reset the count and track+unsubscribe
// every listener a test registers so neither leaks into the next test.
const unsubscribers: (() => void)[] = [];
const subscribe = (listener: () => void) => {
  const unsubscribe = subscribeRouteProgress(listener);
  unsubscribers.push(unsubscribe);
  return unsubscribe;
};

beforeEach(() => {
  resetRouteProgress();
});

afterEach(() => {
  unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
});

describe('getRouteProgressServerSnapshot', () => {
  it('is always false — the server has no concept of an in-flight client navigation', () => {
    expect(getRouteProgressServerSnapshot()).toBe(false);
  });
});

describe('start/end ref-counting', () => {
  it('is idle before any navigation starts', () => {
    expect(getRouteProgressSnapshot()).toBe(false);
  });

  it('goes active on the first start and idle after the matching end', () => {
    startRouteProgress();
    expect(getRouteProgressSnapshot()).toBe(true);

    endRouteProgress();
    expect(getRouteProgressSnapshot()).toBe(false);
  });

  it('stays active while a second overlapping navigation is still in flight', () => {
    startRouteProgress();
    startRouteProgress();
    endRouteProgress();
    expect(getRouteProgressSnapshot()).toBe(true);

    endRouteProgress();
    expect(getRouteProgressSnapshot()).toBe(false);
  });

  it('does not go negative on an unbalanced end — clamped to 0', () => {
    endRouteProgress();
    endRouteProgress();
    expect(getRouteProgressSnapshot()).toBe(false);

    startRouteProgress();
    expect(getRouteProgressSnapshot()).toBe(true);
  });
});

describe('notifications', () => {
  it('notifies subscribers only on the 0→1 and 1→0 transitions, not every call', () => {
    const listener = vi.fn();
    subscribe(listener);

    startRouteProgress(); // 0 -> 1: notifies
    startRouteProgress(); // 1 -> 2: no notify
    endRouteProgress(); // 2 -> 1: no notify
    endRouteProgress(); // 1 -> 0: notifies

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('an unbalanced end at 0 still fires a spurious notify (Math.max(0, -1) === 0 satisfies the check)', () => {
    const listener = vi.fn();
    subscribe(listener);

    endRouteProgress();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resetRouteProgress is a no-op (no notify) when already idle', () => {
    const listener = vi.fn();
    subscribe(listener);

    resetRouteProgress();

    expect(listener).not.toHaveBeenCalled();
  });

  it('resetRouteProgress forces idle and notifies once regardless of the active count', () => {
    startRouteProgress();
    startRouteProgress();
    const listener = vi.fn();
    subscribe(listener);

    resetRouteProgress();

    expect(getRouteProgressSnapshot()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribing stops further notifications', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    unsubscribe();

    startRouteProgress();

    expect(listener).not.toHaveBeenCalled();
  });
});
