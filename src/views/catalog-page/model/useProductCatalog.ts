import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFilters } from '@/features/product-filter';
import { usePaginationBounds } from '@/shared/lib/hooks';
import {
  getItemsToRender,
  useGetCategoriesQuery,
  useGetProductsQuery,
  type ProductsResponse,
  type Categories,
} from '@/entities/product';
import { buildProductParams, computeShouldSkip, deriveCatalogStatus } from './catalogDerivation';

const ITEMS_PER_PAGE = 12;

// initialProducts/initialCategories come from app/(shop)/catalog/page.tsx's
// server-side fetch for the current URL — used as a fallback so the first
// paint (and every server-rendered navigation, since that route is
// force-dynamic and re-fetches per request) shows real content immediately
// instead of a skeleton, matching the pattern used for /product/[id].
export function useProductCatalog(
  initialProducts?: ProductsResponse,
  initialCategories?: Categories,
) {
  const searchParams = useSearchParams();
  const categoriesQuery = useGetCategoriesQuery();
  const filters = useFilters(1, {
    data: categoriesQuery.data ?? initialCategories,
    isLoading: categoriesQuery.isLoading && !initialCategories?.length,
    isFetching: categoriesQuery.isFetching,
    error: categoriesQuery.error,
  });

  const query = searchParams.get('q');
  const categoryId = filters.activeCategoryOption?.slug;
  const categoryName = filters.activeCategoryOption?.name;

  const filterKey = `${query || ''}-${categoryId || 'all'}-${filters.activeSortOption?.id || 'default'}-${filters.isDealsActive ? 'deals' : 'all'}`;
  const [lastKnownTotal, setLastKnownTotal] = useState<number | null>(
    initialProducts?.total ?? null,
  );
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLastKnownTotal(null);
  }, [filterKey]);

  const params = useMemo(
    () =>
      buildProductParams({
        page: filters.page,
        query,
        sortOption: filters.activeSortOption,
        categorySlug: categoryId,
        categoryName,
        deals: filters.isDealsActive,
      }),
    [
      filters.page,
      query,
      filters.activeSortOption,
      categoryId,
      categoryName,
      filters.isDealsActive,
    ],
  );

  const shouldSkip = computeShouldSkip(filters.page, lastKnownTotal, ITEMS_PER_PAGE);

  const {
    data: productsQueryData,
    isFetching: productsFetching,
    isLoading: productsQueryLoading,
    error: productsError,
  } = useGetProductsQuery(params, { skip: shouldSkip });

  const productsResponse = productsQueryData ?? initialProducts;

  useEffect(() => {
    if (productsResponse?.total !== undefined) {
      setLastKnownTotal(productsResponse.total);
    }
  }, [productsResponse?.total]);

  const totalItems = productsResponse?.total ?? lastKnownTotal ?? 0;

  usePaginationBounds(filters.page, totalItems, ITEMS_PER_PAGE, filters.setPage, productsError);

  const { displayLoading, displayFetching, displayError, isEmpty } = deriveCatalogStatus({
    isLoading: productsQueryLoading,
    isFetching: productsFetching,
    error: productsError,
    response: productsResponse,
    totalItems,
    shouldSkip,
  });

  const itemsToRender = useMemo(
    () => getItemsToRender(productsResponse, !!displayLoading, ITEMS_PER_PAGE),
    [productsResponse, displayLoading],
  );

  return {
    products: {
      items: itemsToRender,
      total: totalItems,
      query,
    },
    status: {
      productsLoading: displayLoading,
      productsFetching: displayFetching,
      productsError: displayError,
      isEmpty,
      categoriesLoading: filters.categoriesLoading,
      categoriesFetching: filters.categoriesFetching,
      categoriesError: filters.categoriesError,
    },
    filters,
  };
}
