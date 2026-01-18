import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { clearSearch, getProductsBySearch } from '@/features/products/store/productsSlice';
import { useAppDispatch, useAppSelector } from "@/store/hook";

export function useSearch() {
    const navRef = useRef<HTMLDivElement>(null); 
    const dispatch = useAppDispatch();
    
    const { searchStatus } = useAppSelector((state) => state.products);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    const isLoading = searchStatus === 'loading';

    const queryFromUrl = searchParams.get('q') || '';

    useEffect(() => {
        setSearchQuery(queryFromUrl);

        if (queryFromUrl) {
            setIsSearchActive(true);
            dispatch(getProductsBySearch(queryFromUrl));
        } else {
             dispatch(clearSearch());
        }

    }, [queryFromUrl, dispatch]); 

    const clearSearchResults = useCallback(() => {
        dispatch(clearSearch());
    }, [dispatch]);

    const handleSearch = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery) {
            setSearchParams({ q: trimmedQuery });
        } else {
            setSearchParams({});
            clearSearchResults();
        }
    }, [searchQuery, setSearchParams, clearSearchResults]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);

        if (newValue === '') {
            clearSearchResults();
            setSearchParams({})
        } else if (!isSearchActive) {
            setIsSearchActive(true);
        }
    }, [isSearchActive, clearSearchResults]);

    const handleSearchActive = useCallback(() => {
        if (!searchQuery) {
            setIsSearchActive(prev => !prev);
        }
    }, [searchQuery]);

    const handleClear = useCallback(() => {
        setSearchQuery('');
        setSearchParams({});
        clearSearchResults();
        setIsSearchActive(false);
    }, [setSearchParams, clearSearchResults]);

    return {
        isLoading,
        searchQuery,
        navRef,
        handleSearch,
        handleClear,
        handleInputChange,
        isSearchActive,
        handleSearchActive
    };
}