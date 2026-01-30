import { getProducts } from "@/store/slices/productsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useSort } from "./useSort";
import { selectAllProducts, } from "@/store/selectors/productSelectors";
import { useUrlPagination } from "./useUrlPagination";
import { sortingOptions } from "@/utils";

export function useProductCatalog() {
    const productsToDisplay = useAppSelector(selectAllProducts);
    const { status, total, error } = useAppSelector((state) => state.products)
    const [searchParams] = useSearchParams();
    const { activeSortOption } = useSort()
    const dispatch = useAppDispatch()

    const query = searchParams.get('q')

    const { page, setPage } = useUrlPagination()


    useEffect(() => {

        const params = {
            page: page,
            sortBy: activeSortOption.sortBy,
            order: activeSortOption.order,
            search: query || undefined
        };


        dispatch(getProducts(params));

    }, [dispatch, page, activeSortOption, query]);

    const totalItems = total

    return { productsToDisplay, setPage, page, status, sortingOptions, totalItems, query, error }
}