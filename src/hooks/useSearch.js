import { useState } from "react";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { clearSearch, getProductsBySearch } from "../store/features/productsSlice";
import { useScrollEffect } from "./useScrollEffect";

export default function useSearch(style) {
    const navRef = useRef(null);
    const dispatch = useDispatch();
    const { searchStatus } = useSelector((state) => state.products);

    const [searchQuery, setSearchQuery] = useState('');

    useScrollEffect(style, navRef);

    const isLoading = searchStatus === 'loading';

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        dispatch(getProductsBySearch(searchQuery));
    };

    const updateSearchText = (text) => {
        setSearchQuery(text);
    };

    const clearSearchResults = () => {
        dispatch(clearSearch())
    }

    const handleClear = () => {
        updateSearchText('');
        clearSearchResults();
    }

    const handleInputChange = (event) => {
        const newText = event.target.value
        updateSearchText(newText)
        if (newText === ''){
            clearSearchResults();
        }
    }

    return { isLoading, searchQuery, navRef, handleSearch, handleClear, handleInputChange }
}