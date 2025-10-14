import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearSearch, getProductsBySearch } from '@/features/products/store/productsSlice';

export function useSearch() {
    const navRef = useRef(null);
    const dispatch = useDispatch();
    const { searchStatus } = useSelector((state) => state.products);
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

const updateSearchText = (text) => {
    setSearchQuery(text);
};

const clearSearchResults = () => {
    dispatch(clearSearch())
}

const handleClear = () => {
    updateSearchText('');
    clearSearchResults();
    setIsSearchActive(false)
}

const handleInputChange = (event) => {
    const newText = event.target.value
    if (searchQuery) {
        setIsSearchActive(true)
    }
    updateSearchText(newText)
    if (newText === '') {
        clearSearchResults();
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