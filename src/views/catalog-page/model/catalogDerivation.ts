import { isRangeError } from '@/shared/lib';
import { ProductParams, ProductsResponse, SortingOption } from '@/entities/product';

interface BuildProductParamsInput {
  page: number;
  query: string | null;
  sortOption?: SortingOption;
  categorySlug?: string;
  categoryName?: string;
  deals: boolean;
}

// Category is sent by its display name, not its slug — fetchProducts
// (entities/product/api/queries.ts) filters on the products_view's `category`
// text column, which stores the name.
export const buildProductParams = ({
  page,
  query,
  sortOption,
  categorySlug,
  categoryName,
  deals,
}: BuildProductParamsInput): ProductParams => {
  const params: ProductParams = { page };
  if (query) params.search = query;
  if (sortOption) {
    params.sortBy = sortOption.sortBy;
    params.order = sortOption.order;
  }
  if (categorySlug !== 'all' && categoryName) params.category = categoryName;
  if (deals) params.deals = true;

  return params;
};

// Once a filter change (category/sort/search/deals) has already fetched a
// smaller result set, keep the URL's page number from re-requesting a page
// past the new end — skip the query entirely rather than let a genuine 416
// round-trip.
export const computeShouldSkip = (
  page: number,
  lastKnownTotal: number | null,
  itemsPerPage: number,
): boolean => {
  if (lastKnownTotal === null) return false;
  const totalPages = Math.ceil(lastKnownTotal / itemsPerPage);
  return totalPages > 0 && page > totalPages;
};

interface DeriveCatalogStatusInput {
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  response: ProductsResponse | undefined;
  totalItems: number;
  shouldSkip: boolean;
}

interface CatalogStatus {
  displayLoading: boolean;
  displayFetching: boolean;
  displayError: unknown;
  isEmpty: boolean;
}

// A range error (the URL's page landed past the end, e.g. after an external
// filter change) is deliberately rendered as a loading state, not a real
// error — usePaginationBounds is what corrects the page in that case.
export const deriveCatalogStatus = ({
  isLoading,
  isFetching,
  error,
  response,
  totalItems,
  shouldSkip,
}: DeriveCatalogStatusInput): CatalogStatus => {
  const outOfBounds = isRangeError(error);
  const displayLoading = (isLoading && !response) || outOfBounds || shouldSkip;
  const displayFetching = isFetching || outOfBounds || shouldSkip;
  const displayError = outOfBounds ? null : error;
  const isEmpty = Boolean(!displayLoading && !displayError && response && totalItems === 0);

  return { displayLoading, displayFetching, displayError, isEmpty };
};
