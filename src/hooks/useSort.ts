import { sortingOptions } from "@/utils";
import { useSearchParams } from "react-router";

export function useSort() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentSortBy = searchParams.get('sortBy') || 'default';
    const currentOrder = searchParams.get('order') || 'asc';

    const activeSortOption = sortingOptions.find(opt => opt.id === currentSortBy);

    const changeSort = (newSortBy: string, newOrder: string = 'asc') => {
        setSearchParams((prevParams) => {
            prevParams.set('sortBy', newSortBy);
            prevParams.set('order', newOrder);


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