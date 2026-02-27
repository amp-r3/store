import { sortingOptions } from "@/utils";
import { useSearchParams } from "react-router";

export function useSort() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentSortBy = searchParams.get('sortBy');
    const currentOrder = searchParams.get('order');

    const activeSortOption = sortingOptions.find(
        (opt) => opt.sortBy === currentSortBy && opt.order === currentOrder
    ) || sortingOptions[0];

    const changeSort = (newSortBy: string | null, newOrder: string | null) => {
        setSearchParams((prevParams) => {
            if (newSortBy && newOrder) {
                prevParams.set('sortBy', newSortBy);
                prevParams.set('order', newOrder);
            } else {
                prevParams.delete('sortBy');
                prevParams.delete('order');
            }

            prevParams.delete('page');

            return prevParams;
        });
    };

    return {
        currentSortBy,
        currentOrder,
        changeSort,
        activeSortOption,
        sortingOptions
    };
}