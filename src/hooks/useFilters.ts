import { useSearchParams } from "react-router";
import { sortingOptions, categoryOptions, CategoryId } from "@/utils";

export function useFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentSortBy = searchParams.get('sortBy');
    const currentOrder = searchParams.get('order');
    const currentCategory = (searchParams.get('category') as CategoryId) || 'all';

    const activeSortOption = sortingOptions.find(
        (opt) => opt.sortBy === currentSortBy && opt.order === currentOrder
    ) || sortingOptions[0];

    const activeCategoryOption = categoryOptions.find(
        (opt) => opt.id === currentCategory
    ) || categoryOptions[0];

    const updateParams = (updates: Record<string, string | null>) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === 'all') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });
            newParams.delete('page');
            
            return newParams;
        }, { replace: true });
    };

    const changeSort = (newSortBy: string, newOrder: string) => {
        if (newSortBy && newOrder) {
            updateParams({ sortBy: newSortBy, order: newOrder });
        } else {
            updateParams({ sortBy: null, order: null });
        }
    };

    const changeCategory = (newCategory: CategoryId | null) => {
        updateParams({ category: newCategory });
    };

    const clearAllFilters = () => {
        updateParams({
            sortBy: null,
            order: null,
            category: null
        });
    };

    return {
        currentSortBy,
        currentOrder,
        currentCategory,
        activeSortOption,
        activeCategoryOption,
        sortingOptions,
        categoryOptions,
        changeSort,
        changeCategory,
        clearAllFilters
    };
}