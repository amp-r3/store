import { getProducts, selectAllProducts } from "@/features/products/store/productsSlice";
import { sortingOptions } from "@/features/products/utils";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useSort } from "./useSort";

export function useProductCatalog() {
    const { status, searchResults } = useAppSelector((state) => state.products)
    const productArray = useAppSelector(selectAllProducts);
    const [searchParams, setSearchParams] = useSearchParams();
    const { activeSortOption } = useSort()
    const dispatch = useAppDispatch()

    const isSearchActive = searchResults !== null;

    const currentPage = Number(searchParams.get('page')) || 1;


    const setCurrentPage = (newPage) => {
        setSearchParams({ page: newPage });
    };


    useEffect(() => {

        const params = {
            page: currentPage,
            sortBy: activeSortOption.sortBy,
            order: activeSortOption.order
        };


        dispatch(getProducts(params));

    }, [dispatch, currentPage, isSearchActive, activeSortOption]);

    const productsToDisplay = isSearchActive ? searchResults : productArray;

    return { productsToDisplay, setCurrentPage, currentPage, status, isSearchActive, sortingOptions }
}