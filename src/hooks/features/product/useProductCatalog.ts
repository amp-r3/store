import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useGetProductsQuery } from "@/services/productsApi";
import { useFilters } from "./useFilters";

export function useProductCatalog() {
    const [searchParams] = useSearchParams();
    const { activeSortOption, page, setPage, activeCategoryOption, categories, categoriesLoading, categoriesFetching } = useFilters()

    const categoryId = activeCategoryOption?.slug


    const query = searchParams.get('q')

    const params = useMemo(() => {
        const p: Record<string, any> = { page };
        if (query) p.search = query;
        if (activeSortOption) {
            p.sortBy = activeSortOption.sortBy;
            p.order = activeSortOption.order;
        }

        if (categoryId !== 'all') {
            p.category = categoryId;
        }

        return p;
    }, [page, query, activeSortOption, activeCategoryOption]);

    const {
        data: productsResponse,
        isFetching: productsFetching,
        isLoading: productsLoading,
        error: productsError
    } = useGetProductsQuery(params);


    const totalItems = useMemo(() => {
        if (!productsResponse?.total) return 0

        return productsResponse.total
    }, [productsResponse])

    const productsArray = useMemo(() => {
        if (!productsResponse?.items || !productsResponse?.ids) return [];
        return productsResponse.ids.map((id) => productsResponse.items[id]);

    }, [productsResponse]);

    const itemsToRender = productsLoading && productsArray.length === 0
        ? Array.from({ length: 8 })
        : productsArray;

    return { productsArray: itemsToRender, setPage, page, productsLoading, productsFetching, categoriesLoading, categoriesFetching, totalItems, query, productsError, categories }
}