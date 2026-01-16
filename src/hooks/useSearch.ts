import { useState, useRef } from "react";
import { clearSearch, getProductsBySearch } from '@/features/products/store/productsSlice';
import { useAppDispatch, useAppSelector } from "@/store/hook";

export function useSearch() {
    const navRef = useRef(null);
    const dispatch = useAppDispatch();
    const { searchStatus } = useAppSelector((state) => state.products);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false)

    const isLoading = searchStatus === 'loading';

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        dispatch(getProductsBySearch(searchQuery));
    };

    const handleSearchActive = () => {
        if (!searchQuery) {
            setIsSearchActive(!isSearchActive)
        }
    }

    const clearSearchResults = () => {
        dispatch(clearSearch())
    }

    const handleClear = () => {
        setSearchQuery('');
        clearSearchResults();
        setIsSearchActive(false)
    }

    const handleInputChange = (event) => {
        const newText = event.target.value;
        setSearchQuery(newText);

        if (newText === '') {
            clearSearchResults();
        } else if (!isSearchActive) {
            setIsSearchActive(true);
        }
    }

    return {
        isLoading,
        searchQuery,
        navRef,
        handleSearch,
        handleClear,
        handleInputChange,
        isSearchActive,
        handleSearchActive
    }
}