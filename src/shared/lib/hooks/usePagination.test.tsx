import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePagination, DOTS } from './usePagination';

describe('usePagination — totalPages', () => {
  it('is 0 for zero/negative totalItems or itemsPerPage', () => {
    expect(
      renderHook(() => usePagination({ totalItems: 0, currentPage: 1, itemsPerPage: 12 })).result
        .current.totalPages,
    ).toBe(0);
    expect(
      renderHook(() => usePagination({ totalItems: 24, currentPage: 1, itemsPerPage: 0 })).result
        .current.totalPages,
    ).toBe(0);
  });

  it('rounds up to a whole page', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 25, currentPage: 1, itemsPerPage: 12 }),
    );
    expect(result.current.totalPages).toBe(3);
  });
});

describe('usePagination — paginationRange', () => {
  it('is empty when there are no pages', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 0, currentPage: 1, itemsPerPage: 12 }),
    );
    expect(result.current.paginationRange).toEqual([]);
  });

  it('is a single page for exactly one page', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 5, currentPage: 1, itemsPerPage: 12 }),
    );
    expect(result.current.paginationRange).toEqual([1]);
  });

  it('shows every page when the total fits within the fixed slot count (no dots needed)', () => {
    // siblingCount 1 (default) -> totalSlots = 1*2 + 5 = 7
    const { result } = renderHook(() =>
      usePagination({ totalItems: 70, currentPage: 3, itemsPerPage: 10 }),
    );
    expect(result.current.totalPages).toBe(7);
    expect(result.current.paginationRange).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows right-side dots only when near the start', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, currentPage: 1, itemsPerPage: 10 }),
    );
    expect(result.current.totalPages).toBe(10);
    expect(result.current.paginationRange).toEqual([1, 2, 3, 4, 5, DOTS, 10]);
  });

  it('shows both dots when in the middle', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, currentPage: 5, itemsPerPage: 10 }),
    );
    expect(result.current.paginationRange).toEqual([1, DOTS, 4, 5, 6, DOTS, 10]);
  });

  it('shows left-side dots only when near the end', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, currentPage: 10, itemsPerPage: 10 }),
    );
    expect(result.current.paginationRange).toEqual([1, DOTS, 6, 7, 8, 9, 10]);
  });

  it('clamps an out-of-range currentPage (0, negative, or past the end) without throwing', () => {
    const zero = renderHook(() =>
      usePagination({ totalItems: 100, currentPage: 0, itemsPerPage: 10 }),
    );
    expect(zero.result.current.paginationRange[0]).toBe(1);

    const negative = renderHook(() =>
      usePagination({ totalItems: 100, currentPage: -5, itemsPerPage: 10 }),
    );
    expect(negative.result.current.paginationRange[0]).toBe(1);

    const past = renderHook(() =>
      usePagination({ totalItems: 100, currentPage: 999, itemsPerPage: 10 }),
    );
    const pastRange = past.result.current.paginationRange;
    expect(pastRange[pastRange.length - 1]).toBe(10);
  });

  it('honors a wider siblingCount', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 200, currentPage: 10, itemsPerPage: 10, siblingCount: 2 }),
    );
    // totalPages = 20, totalSlots = 2*2 + 5 = 9 < 20 -> windowed
    expect(result.current.paginationRange).toEqual([1, DOTS, 8, 9, 10, 11, 12, DOTS, 20]);
  });
});
