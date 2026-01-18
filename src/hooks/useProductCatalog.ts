import { getProducts, selectAllProducts } from "@/features/products/store/productsSlice";
import { sortingOptions } from "@/features/products/utils";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export function useProductCatalog() {
    const { status, searchResults } = useAppSelector((state) => state.products)
    const productArray = useAppSelector(selectAllProducts);
    const [searchParams, setSearchParams] = useSearchParams();
    const isSearchActive = searchResults !== null;
    const dispatch = useAppDispatch()


    const [currentSortId, setCurrentSortId] = useState('default');

    const currentPage = Number(searchParams.get('page')) || 1;


    const setCurrentPage = (newPage) => {
        setSearchParams({ page: newPage });
    };

    const activeSortOption = sortingOptions.find(opt => opt.id === currentSortId);

    useEffect(() => {
        if (!isSearchActive) {

            const params = {
                page: currentPage,
                sortBy: activeSortOption.sortBy,
                order: activeSortOption.order
            };

            dispatch(getProducts(params));
        }
    }, [dispatch, currentPage, isSearchActive, activeSortOption ]);

    const productsToDisplay = isSearchActive ? searchResults : productArray;
    
    return { productsToDisplay, setCurrentSortId, currentSortId, setCurrentPage, currentPage, status, isSearchActive, sortingOptions, activeSortOption }
}