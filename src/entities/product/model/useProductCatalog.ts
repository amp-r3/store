import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/features/product-filter";
import { usePaginationBounds } from "@/shared/lib/hooks";
import { getItemsToRender } from "../lib/formatters";
import { useGetCategoriesQuery, useGetProductsQuery } from "../api/productsApi";
import { ProductParams, ProductsResponse, Categories } from "../api/queries";

const ITEMS_PER_PAGE = 12;

// initialProducts/initialCategories come from app/(shop)/catalog/page.tsx's
// server-side fetch for the current URL — used as a fallback so the first
// paint (and every server-rendered navigation, since that route is
// force-dynamic and re-fetches per request) shows real content immediately
// instead of a skeleton, matching the pattern used for /product/[id].
export function useProductCatalog(initialProducts?: ProductsResponse, initialCategories?: Categories) {
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
    const [lastKnownTotal, setLastKnownTotal] = useState<number | null>(initialProducts?.total ?? null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setLastKnownTotal(null);
    }, [filterKey]);

    const params = useMemo(() => {
        const p: ProductParams = { page: filters.page };
        if (query) p.search = query;
        if (filters.activeSortOption) {
            p.sortBy = filters.activeSortOption.sortBy;
            p.order = filters.activeSortOption.order;
        }
        if (categoryId !== 'all' && categoryName) p.category = categoryName;
        if (filters.isDealsActive) p.deals = true;

        return p;
    }, [filters.page, query, filters.activeSortOption, categoryId, categoryName, filters.isDealsActive]);

    const totalPages = lastKnownTotal !== null ? Math.ceil(lastKnownTotal / ITEMS_PER_PAGE) : null;
    const shouldSkip = lastKnownTotal !== null && totalPages !== null && totalPages > 0 && filters.page > totalPages;

    const {
        data: productsQueryData,
        isFetching: productsFetching,
        isLoading: productsQueryLoading,
        error: productsError
    } = useGetProductsQuery(params, { skip: shouldSkip });

    const productsResponse = productsQueryData ?? initialProducts;

    useEffect(() => {
        if (productsResponse?.total !== undefined) {
            setLastKnownTotal(productsResponse.total);
        }
    }, [productsResponse?.total]);

    const totalItems = productsResponse?.total ?? lastKnownTotal ?? 0;

    usePaginationBounds(
        filters.page,
        totalItems,
        ITEMS_PER_PAGE,
        filters.setPage,
        productsError
    );

    const isOutOfBoundsError =
        productsError &&
        typeof productsError === 'object' &&
        'status' in productsError &&
        (productsError.status === 416 || productsError.status === 'PGRST103');

    const displayLoading = (productsQueryLoading && !productsResponse) || isOutOfBoundsError || shouldSkip;
    const displayFetching = productsFetching || isOutOfBoundsError || shouldSkip;
    const displayError = isOutOfBoundsError ? null : productsError;

    const isEmpty = Boolean(
        !displayLoading &&
        !displayError &&
        productsResponse &&
        totalItems === 0
    );

    const itemsToRender = useMemo(
        () => getItemsToRender(productsResponse, !!displayLoading, ITEMS_PER_PAGE),
        [productsResponse, displayLoading]
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
        filters
    };
}
