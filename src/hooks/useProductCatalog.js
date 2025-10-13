import { getProducts } from "@/features/products/store/productsSlice";
import { sortingOptions } from "@/features/products/utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";

export function useProductCatalog() {
    const { products, status, searchResults } = useSelector((state) => state.products)
    const [searchParams, setSearchParams] = useSearchParams();
    const isSearchActive = searchResults !== null;
    const dispatch = useDispatch()

    const [currentSortId, setCurrentSortId] = useState('default');

    const currentPage = Number(searchParams.get('page')) || 1;


    const setCurrentPage = (newPage) => {
        setSearchParams({ page: newPage });
    };


    useEffect(() => {
        if (!isSearchActive) {
            const activeSortOption = sortingOptions.find(opt => opt.id === currentSortId);

            const params = {
                page: currentPage,
                sortBy: activeSortOption.sortBy,
                order: activeSortOption.order
            };
            console.log(params);

            dispatch(getProducts(params));
        }
    }, [dispatch, currentPage, isSearchActive, currentSortId]);

    const productsToDisplay = isSearchActive ? searchResults : products;
    
    return { productsToDisplay, setCurrentSortId, currentSortId, setCurrentPage, currentPage, status, isSearchActive, sortingOptions }
}