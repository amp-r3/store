import { describe, it, expect } from 'vitest';
import { buildProductParams, computeShouldSkip, deriveCatalogStatus } from './catalogDerivation';
import { SortingOption, ProductsResponse } from '@/entities/product';

const sortOption: SortingOption = {
  id: 'price-asc',
  label: 'Price: Low to High',
  sortBy: 'price',
  order: 'asc',
  icon: () => null,
};

describe('buildProductParams', () => {
  it('always includes the page', () => {
    expect(buildProductParams({ page: 2, query: null, deals: false })).toEqual({ page: 2 });
  });

  it('includes search only when a query is present', () => {
    expect(buildProductParams({ page: 1, query: 'boots', deals: false })).toMatchObject({
      search: 'boots',
    });
    expect(buildProductParams({ page: 1, query: '', deals: false })).not.toHaveProperty('search');
  });

  it('includes sortBy/order only when a sort option is active', () => {
    const params = buildProductParams({ page: 1, query: null, sortOption, deals: false });
    expect(params.sortBy).toBe('price');
    expect(params.order).toBe('asc');
  });

  // Sent by display name, not slug — fetchProducts filters the
  // products_view's `category` text column, which stores the name.
  it('includes category by name, and only when the slug is not "all"', () => {
    const params = buildProductParams({
      page: 1,
      query: null,
      categorySlug: 'apparel',
      categoryName: 'Apparel',
      deals: false,
    });
    expect(params.category).toBe('Apparel');
  });

  it('omits category when the slug is "all"', () => {
    const params = buildProductParams({
      page: 1,
      query: null,
      categorySlug: 'all',
      categoryName: 'All Products',
      deals: false,
    });
    expect(params).not.toHaveProperty('category');
  });

  it('omits category when the slug has resolved but the name has not', () => {
    const params = buildProductParams({
      page: 1,
      query: null,
      categorySlug: 'apparel',
      categoryName: undefined,
      deals: false,
    });
    expect(params).not.toHaveProperty('category');
  });

  it('includes deals only when active', () => {
    expect(buildProductParams({ page: 1, query: null, deals: true })).toMatchObject({
      deals: true,
    });
    expect(buildProductParams({ page: 1, query: null, deals: false })).not.toHaveProperty('deals');
  });
});

describe('computeShouldSkip', () => {
  it('is false when the last known total is not yet known', () => {
    expect(computeShouldSkip(5, null, 12)).toBe(false);
  });

  it('is false when the requested page is within bounds', () => {
    expect(computeShouldSkip(1, 24, 12)).toBe(false);
    expect(computeShouldSkip(2, 24, 12)).toBe(false);
  });

  it('is true once the page is past the last known total’s page count', () => {
    expect(computeShouldSkip(3, 24, 12)).toBe(true);
  });

  it('is false for an exact page boundary (12 items, page 1)', () => {
    expect(computeShouldSkip(1, 12, 12)).toBe(false);
    expect(computeShouldSkip(2, 12, 12)).toBe(true);
  });

  it('is false for a zero total (no filter results) rather than skipping forever', () => {
    expect(computeShouldSkip(1, 0, 12)).toBe(false);
  });
});

describe('deriveCatalogStatus', () => {
  const response: ProductsResponse = { items: {}, ids: [1], total: 1 };

  it('is loading while the first fetch is in flight with no data yet', () => {
    const status = deriveCatalogStatus({
      isLoading: true,
      isFetching: true,
      error: undefined,
      response: undefined,
      totalItems: 0,
      shouldSkip: false,
    });
    expect(status.displayLoading).toBe(true);
    expect(status.displayFetching).toBe(true);
  });

  it('is not "loading" once a response exists, even if isLoading is still true', () => {
    const status = deriveCatalogStatus({
      isLoading: true,
      isFetching: false,
      error: undefined,
      response,
      totalItems: 1,
      shouldSkip: false,
    });
    expect(status.displayLoading).toBe(false);
  });

  it('reports a non-range error as-is', () => {
    const error = { status: 500 };
    const status = deriveCatalogStatus({
      isLoading: false,
      isFetching: false,
      error,
      response: undefined,
      totalItems: 0,
      shouldSkip: false,
    });
    expect(status.displayError).toBe(error);
  });

  // A range error (page landed past the end after a filter change) is
  // rendered as a loading state, not a real error — usePaginationBounds
  // corrects the page, at which point a normal refetch replaces this.
  it('treats a range error as loading, not an error, and null-hides it', () => {
    const status = deriveCatalogStatus({
      isLoading: false,
      isFetching: false,
      error: { status: 416 },
      response: undefined,
      totalItems: 0,
      shouldSkip: false,
    });
    expect(status.displayError).toBeNull();
    expect(status.displayLoading).toBe(true);
    expect(status.displayFetching).toBe(true);
  });

  it('treats shouldSkip as loading/fetching too, to avoid an empty-state flash', () => {
    const status = deriveCatalogStatus({
      isLoading: false,
      isFetching: false,
      error: undefined,
      response: undefined,
      totalItems: 0,
      shouldSkip: true,
    });
    expect(status.displayLoading).toBe(true);
    expect(status.displayFetching).toBe(true);
  });

  it('is empty only once loading/error/skip are all clear and totalItems is 0 with a response present', () => {
    const status = deriveCatalogStatus({
      isLoading: false,
      isFetching: false,
      error: undefined,
      response: { items: {}, ids: [], total: 0 },
      totalItems: 0,
      shouldSkip: false,
    });
    expect(status.isEmpty).toBe(true);
  });

  it('is not empty before a response has arrived at all', () => {
    const status = deriveCatalogStatus({
      isLoading: false,
      isFetching: false,
      error: undefined,
      response: undefined,
      totalItems: 0,
      shouldSkip: false,
    });
    expect(status.isEmpty).toBe(false);
  });
});
