import { useSearchParams } from "react-router";
import { sortingOptions } from "@/utils";
import { Categories, Category } from "@/services/productsApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { SortingOption } from "@/utils/sortingOptions";
import { useCallback, useMemo } from "react";

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

export function useFilters
    (defaultPage = 1,
        { data: categories = [],
            isLoading: categoriesLoading,
            isFetching: categoriesFetching,
            error: categoriesError,
        }: CategoriesQueryProps): UseFilterReturn {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentSortBy = searchParams.get('sortBy');
    const currentOrder = searchParams.get('order');
    const currentCategory = searchParams.get('category') || 'all';

    const rawPage = Number(searchParams.get('page'));
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : defaultPage;

    const activeSortOption = useMemo(() => sortingOptions.find(
        (opt) => opt.sortBy === currentSortBy && opt.order === currentOrder
    ) || sortingOptions[0], [currentSortBy, currentOrder]);

    const activeCategoryOption = useMemo(() => categories.find(
        (opt) => opt.slug === currentCategory
    ), [categories, currentCategory]);

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
        page,
        currentSortBy,
        currentOrder,
        currentCategory,
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