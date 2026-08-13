import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { sortingOptions, Categories } from '@/entities/product';
import { useFilters } from './useFilters';

// Stable references, not new objects per call — useTransitionRouter and
// useUrlState put the router/searchParams objects straight into
// useCallback/useEffect dependency arrays, so a mock returning a fresh
// object every render loops infinitely (see LoginForm.test.tsx's comment,
// and 0b7f8ee's production fix for the same class of bug).
const router = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/catalog',
  useSearchParams: () => searchParams,
}));

const categories: Categories = [
  { slug: 'apparel', name: 'Apparel' },
  { slug: 'shoes', name: 'Shoes' },
];

const loadedCategories = {
  data: categories,
  isLoading: false,
  isFetching: false,
  error: undefined,
};
const loadingCategories = { data: [], isLoading: true, isFetching: false, error: undefined };

const lastReplaceUrl = () =>
  router.replace.mock.calls[router.replace.mock.calls.length - 1]?.[0] as string | undefined;
const lastPushUrl = () =>
  router.push.mock.calls[router.push.mock.calls.length - 1]?.[0] as string | undefined;

beforeEach(() => {
  router.push.mockClear();
  router.replace.mockClear();
  searchParams = new URLSearchParams();
});

describe('useFilters — URL derivation', () => {
  it('falls back to "all" when the URL names a category the fetched list does not contain', () => {
    searchParams = new URLSearchParams('category=discontinued');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    expect(result.current.currentCategory).toBe('all');
  });

  it('leaves an unrecognized category intact while the category list has not loaded yet', () => {
    searchParams = new URLSearchParams('category=discontinued');
    const { result } = renderHook(() => useFilters(1, loadingCategories));

    expect(result.current.currentCategory).toBe('discontinued');
  });

  it('accepts a category the fetched list does contain', () => {
    searchParams = new URLSearchParams('category=shoes');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    expect(result.current.currentCategory).toBe('shoes');
    expect(result.current.activeCategoryOption).toEqual(categories[1]);
  });

  it('falls back to sortingOptions[0] for an unrecognized sortBy/order pair', () => {
    searchParams = new URLSearchParams('sortBy=bogus&order=asc');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    expect(result.current.activeSortOption).toBe(sortingOptions[0]);
  });

  it('resolves a recognized sortBy/order pair', () => {
    const target = sortingOptions[1];
    searchParams = new URLSearchParams(`sortBy=${target.sortBy}&order=${target.order}`);
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    expect(result.current.activeSortOption).toBe(target);
  });
});

describe('useFilters — URL mutation', () => {
  it('a filter change (changeCategory) deletes page from the URL, resetting pagination', () => {
    searchParams = new URLSearchParams('page=3');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.changeCategory('shoes');
    });

    expect(lastReplaceUrl()).not.toMatch(/page=/);
    expect(lastReplaceUrl()).toMatch(/category=shoes/);
  });

  it('setPage keeps page in the URL and pushes rather than replaces', () => {
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.setPage(3);
    });

    expect(lastPushUrl()).toMatch(/page=3/);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('changeSort with both values sets sortBy and order', () => {
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.changeSort('price', 'asc');
    });

    expect(lastReplaceUrl()).toMatch(/sortBy=price/);
    expect(lastReplaceUrl()).toMatch(/order=asc/);
  });

  it('changeSort with a null pair clears sortBy and order', () => {
    searchParams = new URLSearchParams('sortBy=price&order=asc');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.changeSort(null, null);
    });

    expect(lastReplaceUrl()).not.toMatch(/sortBy=|order=/);
  });

  it('toggleDeals adds deals=true when off', () => {
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.toggleDeals();
    });

    expect(lastReplaceUrl()).toMatch(/deals=true/);
  });

  it('toggleDeals removes deals when already on', () => {
    searchParams = new URLSearchParams('deals=true');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.toggleDeals();
    });

    expect(lastReplaceUrl()).not.toMatch(/deals=/);
  });

  it('clearAllFilters strips every filter param', () => {
    searchParams = new URLSearchParams('sortBy=price&order=asc&category=shoes&deals=true&page=2');
    const { result } = renderHook(() => useFilters(1, loadedCategories));

    act(() => {
      result.current.clearAllFilters();
    });

    const url = lastReplaceUrl();
    expect(url).not.toMatch(/sortBy=|order=|category=|deals=|page=/);
  });
});
