import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePaginationBounds } from './usePaginationBounds';

describe('usePaginationBounds', () => {
  it('resets to page 1 on a range error, regardless of currentPage/totalItems', () => {
    const setPage = vi.fn();
    renderHook(() => usePaginationBounds(3, 100, 10, setPage, { status: 416 }));
    expect(setPage).toHaveBeenCalledWith(1);
    expect(setPage).toHaveBeenCalledTimes(1);
  });

  it('resets to page 1 on the PGRST103 range-error code', () => {
    const setPage = vi.fn();
    renderHook(() => usePaginationBounds(3, 100, 10, setPage, { status: 'PGRST103' }));
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('clamps currentPage down to totalPages when it overshoots', () => {
    const setPage = vi.fn();
    renderHook(() => usePaginationBounds(5, 30, 10, setPage));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it('does nothing when currentPage is within bounds', () => {
    const setPage = vi.fn();
    renderHook(() => usePaginationBounds(2, 30, 10, setPage));
    expect(setPage).not.toHaveBeenCalled();
  });

  it('does nothing when totalItems is 0 (no pages to clamp to)', () => {
    const setPage = vi.fn();
    renderHook(() => usePaginationBounds(5, 0, 10, setPage));
    expect(setPage).not.toHaveBeenCalled();
  });

  it('a non-range error is ignored, falling through to the bounds check', () => {
    const setPage = vi.fn();
    renderHook(() => usePaginationBounds(5, 30, 10, setPage, { status: 500 }));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it('re-clamps when itemsPerPage shrinks the total on rerender', () => {
    const setPage = vi.fn();
    const { rerender } = renderHook(
      ({ currentPage, totalItems, itemsPerPage }) =>
        usePaginationBounds(currentPage, totalItems, itemsPerPage, setPage),
      { initialProps: { currentPage: 3, totalItems: 30, itemsPerPage: 10 } },
    );
    expect(setPage).not.toHaveBeenCalled();

    rerender({ currentPage: 3, totalItems: 30, itemsPerPage: 15 });
    expect(setPage).toHaveBeenCalledWith(2);
  });
});
