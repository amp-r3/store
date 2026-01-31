import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useSort } from "./useSort";
import { useUrlPagination } from "./useUrlPagination";
import { sortingOptions } from "@/utils";
import { useGetProductsQuery } from "@/services/productsApi";

export function useProductCatalog() {
    const [searchParams] = useSearchParams();
    const { activeSortOption } = useSort()
    const { page, setPage } = useUrlPagination()

    const query = searchParams.get('q')

    const { data, isLoading, isFetching, error, } = useGetProductsQuery({
        page,
        search: query || null,
        sortBy: activeSortOption.sortBy,
        order: activeSortOption.order,
    });

    const totalItems = useMemo(() => {
        if (!data?.total) return 0

        return data.total
    }, [data])



    const productsArray = useMemo(() => {
        if (!data?.items) return [];

        return Object.values(data.items);
    }, [data])

    return { productsArray, setPage, page, isLoading, isFetching, sortingOptions, totalItems, query, error }
}