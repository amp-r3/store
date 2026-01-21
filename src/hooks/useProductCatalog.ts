import { getProducts, selectAllProducts } from "@/features/products/store/productsSlice";
import { sortingOptions } from "@/features/products/utils";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useSort } from "./useSort";

export function useProductCatalog() {
    const { status, searchResults, total } = useAppSelector((state) => state.products)
    const productArray = useAppSelector(selectAllProducts);
    const [searchParams, setSearchParams] = useSearchParams();
    const { activeSortOption } = useSort()
    const dispatch = useAppDispatch()

    const query = searchParams.get('q')

    const isSearchActive = searchResults !== null;

    const currentPage = Number(searchParams.get('page')) || 1;


    const setCurrentPage = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
    };
    
    
    useEffect(() => {

        const params = {
            page: currentPage,
            sortBy: activeSortOption.sortBy,
            order: activeSortOption.order,
            search: query || undefined
        };

        
        dispatch(getProducts(params));
        
    }, [dispatch, currentPage, activeSortOption, query]);

    const productsToDisplay = isSearchActive ? searchResults : productArray;
    
    const totalItems = total

    return { productsToDisplay, setCurrentPage, currentPage, status, isSearchActive, sortingOptions, totalItems }
}