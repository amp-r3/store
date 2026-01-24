import { getProducts } from "@/features/products/store/productsSlice";
import { sortingOptions } from "@/features/products/utils";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useSort } from "./useSort";
import { selectAllProducts,} from "@/features/products/store/selectors";
import { useUrlPagination } from "./useUrlPagination";

export function useProductCatalog() {
    const productsToDisplay = useAppSelector(selectAllProducts);
    const {status, total} = useAppSelector((state) => state.products)
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

    return { productsToDisplay, setPage, page, status, sortingOptions, totalItems }
}