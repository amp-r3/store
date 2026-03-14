import { useSearchParams } from "react-router";
import { sortingOptions, } from "@/utils";
import { useGetCategoriesQuery } from "@/services/productsApi";

export function useFilters(defaultPage = 1) {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        data: categories = [],  
        isLoading: categoriesLoading,
        error: categoriesError
    } = useGetCategoriesQuery();

    const currentSortBy = searchParams.get('sortBy');
    const currentOrder = searchParams.get('order');
    const currentCategory = (searchParams.get('category')) || 'all';
    const page = Number(searchParams.get('page')) || defaultPage;

    const activeSortOption = sortingOptions.find(
        (opt) => opt.sortBy === currentSortBy && opt.order === currentOrder
    ) || sortingOptions[0];

    const activeCategoryOption = categories.find(
        (opt) => opt.slug === currentCategory
    );

    const updateParams = (updates: Record<string, string | number | null>) => {
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
        }, { replace: true });
    };

    const changeSort = (newSortBy?: string, newOrder?: string) => {
        if (newSortBy && newOrder) {
            updateParams({ sortBy: newSortBy, order: newOrder });
        } else {
            updateParams({ sortBy: null, order: null });
        }
    };

    const changeCategory = (newCategory: string | null) => {
        updateParams({ category: newCategory });
    };

    const setPage = (newPage: number) => {
        updateParams({ page: newPage });
    };

    const clearAllFilters = () => {
        updateParams({
            sortBy: null,
            order: null,
            category: null,
            page: null
        });
    };

    return {
        page,
        currentSortBy,
        currentOrder,
        currentCategory,
        activeSortOption,
        activeCategoryOption,
        sortingOptions,
        changeSort,
        changeCategory,
        setPage,
        clearAllFilters
    };
}