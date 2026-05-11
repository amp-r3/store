import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useGetCategoriesQuery, useGetProductsQuery } from "@/services/productsApi";
import { useFilters } from "./useFilters";
import { usePaginationBounds } from "./usePaginationBounds";
import { getItemsToRender } from "@/utils";

const ITEMS_PER_PAGE = 12;

export function useProductCatalog() {
    const [searchParams] = useSearchParams();
    const categories = useGetCategoriesQuery();
    const filters = useFilters(1, categories);

    const query = searchParams.get('q');
    const categoryId = filters.activeCategoryOption?.slug;


    const params = useMemo(() => {
        const p: Record<string, any> = { page: filters.page };
        if (query) p.search = query;
        if (filters.activeSortOption) {
            p.sortBy = filters.activeSortOption.sortBy;
            p.order = filters.activeSortOption.order;
        }
        if (categoryId !== 'all') p.category = categoryId;

        return p;
    }, [filters.page, query, filters.activeSortOption, categoryId]);

    const {
        data: productsResponse,
        isFetching: productsFetching,
        isLoading: productsLoading,
        error: productsError
    } = useGetProductsQuery(params);

    const totalItems = productsResponse?.total || 0;

    usePaginationBounds(
        filters.page,
        totalItems,
        ITEMS_PER_PAGE,
        filters.setPage,
        productsError
    );

    const isOutOfBoundsError = productsError && (
        (productsError as any).status === 416 ||
        (productsError as any).status === 'PGRST103'
    );

    const displayLoading = productsLoading || isOutOfBoundsError;
    const displayFetching = productsFetching || isOutOfBoundsError;
    const displayError = isOutOfBoundsError ? null : productsError;

    const isEmpty = Boolean(
        !displayLoading &&
        !displayError &&
        productsResponse &&
        totalItems === 0
    );

    const itemsToRender = useMemo(
        () => getItemsToRender(productsResponse, displayLoading, ITEMS_PER_PAGE),
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