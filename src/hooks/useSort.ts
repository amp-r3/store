import { sortingOptions } from "@/utils";
import { useSearchParams } from "react-router";

export function useSort() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentSortBy = searchParams.get('sortBy');
    const currentOrder = searchParams.get('order');

    const activeSortOption = sortingOptions.find(
        (opt) => opt.sortBy === currentSortBy && opt.order === currentOrder
    ) || sortingOptions[0];

    const changeSort = (newSortBy?: string, newOrder?: string) => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            if (newSortBy && newOrder) {
                newParams.set('sortBy', newSortBy);
                newParams.set('order', newOrder);
            } else {
                newParams.delete('sortBy');
                newParams.delete('order');
            }

            newParams.delete('page');

            return newParams;
        }, { replace: true });
    };

    return {
        currentSortBy,
        currentOrder,
        changeSort,
        activeSortOption,
        sortingOptions
    };
}