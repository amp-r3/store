import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useFilters } from "@/features/product-filter";
import { usePaginationBounds } from "@/shared/lib/hooks";
import { getItemsToRender } from "../lib/formatters";
import { useGetCategoriesQuery, useGetProductsQuery } from "../api/productsApi";

const ITEMS_PER_PAGE = 12;

export function useProductCatalog() {
    const [searchParams] = useSearchParams();
    const categories = useGetCategoriesQuery();
    const filters = useFilters(1, categories as any);

    const query = searchParams.get('q');
    const categoryId = filters.activeCategoryOption?.slug;
    const categoryName = filters.activeCategoryOption?.name;

    const filterKey = `${query || ''}-${categoryId || 'all'}-${filters.activeSortOption?.id || 'default'}`;
    const [lastKnownTotal, setLastKnownTotal] = useState<number | null>(null);

    useEffect(() => {
        setLastKnownTotal(null);
    }, [filterKey]);

    const params = useMemo(() => {
        const p: Record<string, any> = { page: filters.page };
        if (query) p.search = query;
        if (filters.activeSortOption) {
            p.sortBy = filters.activeSortOption.sortBy;
            p.order = filters.activeSortOption.order;
        }
        if (categoryId !== 'all' && categoryName) p.category = categoryName;

        return p;
    }, [filters.page, query, filters.activeSortOption, categoryId, categoryName]);

    const totalPages = lastKnownTotal !== null ? Math.ceil(lastKnownTotal / ITEMS_PER_PAGE) : null;
    const shouldSkip = lastKnownTotal !== null && totalPages !== null && totalPages > 0 && filters.page > totalPages;

    const {
        data: productsResponse,
        isFetching: productsFetching,
        isLoading: productsLoading,
        error: productsError
    } = useGetProductsQuery(params, { skip: shouldSkip });

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

    const displayLoading = productsLoading || isOutOfBoundsError || shouldSkip;
    const displayFetching = productsFetching || isOutOfBoundsError || shouldSkip;
    const displayError = isOutOfBoundsError ? null : productsError;

    const isEmpty = Boolean(
        !displayLoading &&
        !displayError &&
        productsResponse &&
        totalItems === 0
    );

    const itemsToRender = useMemo(
        () => getItemsToRender(productsResponse as any, !!displayLoading, ITEMS_PER_PAGE),
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