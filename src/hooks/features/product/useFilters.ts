import { useSearchParams } from "react-router";
import { sortingOptions } from "@/utils";
import { Categories, Category } from "@/services/productsApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { SortingOption } from "@/utils/sortingOptions";
import { useCallback, useMemo } from "react";
import { catalogParamsSchema } from "@/schemas/catalogParamsSchema";

export interface UseFilterReturn {
    page: number;
    currentSortBy: string | null;
    currentOrder: string | null;
    currentCategory: string;
    categories: Categories;
    categoriesLoading: boolean;
    categoriesFetching: boolean;
    categoriesError: FetchBaseQueryError | SerializedError | undefined;
    activeSortOption: SortingOption;
    activeCategoryOption?: Category;
    sortingOptions: SortingOption[];
    changeSort(newSortBy?: string, newOrder?: string): void;
    changeCategory(newCategory: string | null): void;
    setPage(newPage: number): void;
    clearAllFilters(): void;
}

interface CategoriesQueryProps {
    data?: Categories;
    isLoading: boolean;
    isFetching: boolean;
    error?: FetchBaseQueryError | SerializedError;
}



export function useFilters(
    defaultPage = 1,
    { data: categories = [],
        isLoading: categoriesLoading,
        isFetching: categoriesFetching,
        error: categoriesError,
    }: CategoriesQueryProps
): UseFilterReturn {
    const [searchParams, setSearchParams] = useSearchParams();

    const parsed = useMemo(() => {
        const rawParams = {
            page: searchParams.get('page'),
            sortBy: searchParams.get('sortBy'),
            order: searchParams.get('order'),
            category: searchParams.get('category'),
        };
        return catalogParamsSchema.parse(rawParams);
    }, [searchParams]);

    const { page, sortBy, order, category: currentCategory } = parsed;

    const activeSortOption = useMemo(() => {
        return sortingOptions.find(
            (opt) => opt.sortBy === sortBy && opt.order === order
        ) || sortingOptions[0];
    }, [sortBy, order]);

    const currentSortBy = activeSortOption.sortBy;
    const currentOrder = activeSortOption.order;

    const finalCategory = useMemo(() => {
        if (currentCategory === 'all' || categories.length === 0) {
            return currentCategory;
        }
        const exists = categories.some((cat) => cat.slug === currentCategory);
        return exists ? currentCategory : 'all';
    }, [categories, currentCategory]);

    const activeCategoryOption = useMemo(() => {
        return categories.find((opt) => opt.slug === finalCategory);
    }, [categories, finalCategory]);

    const updateParams = useCallback((
        updates: Record<string, string | number | null>,
        action: 'replace' | 'push' = 'replace'
    ) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);

            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === 'all') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, String(value));
                }
            });

            if (!('page' in updates)) {
                newParams.delete('page');
            }

            return newParams;
        }, { replace: action === 'replace' });
    }, [setSearchParams]);

    const changeSort = useCallback((newSortBy?: string, newOrder?: string) => {
        if (newSortBy && newOrder) {
            updateParams({ sortBy: newSortBy, order: newOrder });
        } else {
            updateParams({ sortBy: null, order: null });
        }
    }, [updateParams]);

    const changeCategory = useCallback((newCategory: string | null) => {
        updateParams({ category: newCategory });
    }, [updateParams]);

    const setPage = useCallback((newPage: number) => {
        updateParams({ page: newPage }, 'push');
    }, [updateParams]);

    const clearAllFilters = useCallback(() => {
        updateParams({
            sortBy: null,
            order: null,
            category: null,
            page: null
        });
    }, [updateParams]);

    return {
        page: page !== 1 ? page : defaultPage,
        currentSortBy,
        currentOrder,
        currentCategory: finalCategory,
        categories,
        categoriesLoading,
        categoriesFetching,
        categoriesError,
        activeSortOption,
        activeCategoryOption,
        sortingOptions,
        changeSort,
        changeCategory,
        setPage,
        clearAllFilters
    };
}