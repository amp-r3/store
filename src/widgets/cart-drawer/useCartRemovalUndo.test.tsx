import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { makeCartItemDetails } from '@test/fixtures';
import { CartProduct } from '@/entities/cart';
import { CART_UNDO_DURATION_MS, useCartRemovalUndo } from './useCartRemovalUndo';

// A .tsx file (not .ts) so this routes to Vitest's jsdom `component` project
// (vitest.config.ts routes by extension) — renderHook needs a DOM even
// though this file has no JSX of its own.

describe('useCartRemovalUndo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records the removed row's index and title, read from cartDetails at removal time", () => {
    const detail = makeCartItemDetails({ sizeId: 1, id: 10, quantity: 2, title: 'Denim Jacket' });
    const cartItems: CartProduct[] = [{ sizeId: 1, productId: 10, quantity: 2 }];
    const { result } = renderHook(() =>
      useCartRemovalUndo({ cartItems, cartDetails: [detail], isOpen: true }),
    );

    act(() => {
      result.current.handleRemoved(1, 10, 2);
    });

    expect(result.current.removedEntries).toEqual([
      { sizeId: 1, productId: 10, quantity: 2, index: 0, title: 'Denim Jacket' },
    ]);
  });

  it('auto-dismisses the entry after CART_UNDO_DURATION_MS', () => {
    const { result } = renderHook(() =>
      useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen: true }),
    );

    act(() => {
      result.current.handleRemoved(1, 10, 1);
    });
    expect(result.current.removedEntries).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(CART_UNDO_DURATION_MS);
    });
    expect(result.current.removedEntries).toHaveLength(0);
  });

  it('dismissRemoval cancels the timer and drops the entry immediately', () => {
    const { result } = renderHook(() =>
      useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen: true }),
    );

    act(() => {
      result.current.handleRemoved(1, 10, 1);
    });
    act(() => {
      result.current.dismissRemoval(1);
    });
    expect(result.current.removedEntries).toHaveLength(0);

    // The original timer must actually be cancelled, not just the entry
    // hidden — advancing past it should not resurrect anything.
    act(() => {
      vi.advanceTimersByTime(CART_UNDO_DURATION_MS);
    });
    expect(result.current.removedEntries).toHaveLength(0);
  });

  it('removing the same sizeId twice replaces the entry and restarts its timer', () => {
    const { result } = renderHook(() =>
      useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen: true }),
    );

    act(() => {
      result.current.handleRemoved(1, 10, 1);
    });
    act(() => {
      vi.advanceTimersByTime(CART_UNDO_DURATION_MS - 1000);
    });
    act(() => {
      result.current.handleRemoved(1, 10, 2);
    });

    expect(result.current.removedEntries).toHaveLength(1);
    expect(result.current.removedEntries[0].quantity).toBe(2);

    // The original timer would have fired here had it not been replaced.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.removedEntries).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(CART_UNDO_DURATION_MS - 1000);
    });
    expect(result.current.removedEntries).toHaveLength(0);
  });

  it('handleCleared stores the snapshot and sums quantities into count', () => {
    const { result } = renderHook(() =>
      useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen: true }),
    );
    const snapshot = { 1: { productId: 10, quantity: 2 }, 2: { productId: 20, quantity: 3 } };

    act(() => {
      result.current.handleCleared(snapshot);
    });

    expect(result.current.clearedEntry).toEqual({ snapshot, count: 5 });
  });

  it('handleCleared wipes any pending per-item removal entries', () => {
    const { result } = renderHook(() =>
      useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen: true }),
    );

    act(() => {
      result.current.handleRemoved(1, 10, 1);
    });
    expect(result.current.removedEntries).toHaveLength(1);

    act(() => {
      result.current.handleCleared({});
    });
    expect(result.current.removedEntries).toHaveLength(0);
  });

  it('resets a pending per-item removal when the drawer closes mid-countdown', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) =>
        useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen }),
      { initialProps: { isOpen: true } },
    );

    act(() => {
      result.current.handleRemoved(1, 10, 1);
    });
    expect(result.current.removedEntries).toHaveLength(1);

    rerender({ isOpen: false });

    expect(result.current.removedEntries).toHaveLength(0);
  });

  it('resets a pending clear-cart undo when the drawer closes mid-countdown', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) =>
        useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen }),
      { initialProps: { isOpen: true } },
    );

    act(() => {
      result.current.handleCleared({ 2: { productId: 20, quantity: 1 } });
    });
    expect(result.current.clearedEntry).not.toBeNull();

    rerender({ isOpen: false });

    expect(result.current.clearedEntry).toBeNull();
  });

  it('clears every outstanding timer on unmount without a post-unmount state update', () => {
    const { result, unmount } = renderHook(() =>
      useCartRemovalUndo({ cartItems: [], cartDetails: [], isOpen: true }),
    );

    act(() => {
      result.current.handleRemoved(1, 10, 1);
    });

    unmount();

    // If the timer weren't cleared, this would call setState on an
    // unmounted component, which React reports as an error.
    expect(() => vi.advanceTimersByTime(CART_UNDO_DURATION_MS)).not.toThrow();
  });
});
