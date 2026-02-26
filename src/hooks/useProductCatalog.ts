import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useSort } from "./useSort";
import { useUrlPagination } from "./useUrlPagination";
import { useGetProductsQuery } from "@/services/productsApi";
import { useCategory } from "./useCategory";

export function useProductCatalog() {
    const [searchParams] = useSearchParams();
    const { activeSortOption } = useSort()
    const { activeCategoryOption } = useCategory()
    const { page, setPage } = useUrlPagination()

    const categoryId = activeCategoryOption?.id;

    const query = searchParams.get('q')

    const params = useMemo(() => {
        const p: Record<string, any> = { page };
        if (query) p.q = query;
        if (activeSortOption) {
            p.sortBy = activeSortOption.sortBy;
            p.order = activeSortOption.order;
        }

        if (categoryId && categoryId !== 'all') {
            p.category = categoryId;
        }

        return p;
    }, [page, query, activeSortOption, categoryId]);

    const { data, isLoading, isFetching, error, } = useGetProductsQuery(params);

    const totalItems = useMemo(() => {
        if (!data?.total) return 0

        return data.total
    }, [data])

    const productsArray = useMemo(() => {
        if (!data?.items || !data?.ids) return [];
        return data.ids.map((id) => data.items[id]);

    }, [data]);

    return { productsArray, setPage, page, isLoading, isFetching, totalItems, query, error, }
}