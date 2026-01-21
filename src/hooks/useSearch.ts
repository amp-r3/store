import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { clearSearch } from '@/features/products/store/productsSlice';
import { useAppDispatch } from "@/store/hook";

export function useSearch() {
    const dispatch = useAppDispatch();

    const [searchParams, setSearchParams] = useSearchParams();

    const queryFromUrl = searchParams.get('q') || '';

    const [inputValue, setInputValue] = useState(queryFromUrl);

    useEffect(() => {
        setInputValue(queryFromUrl);
    }, [queryFromUrl]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, []);

    const handleSearch = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedQuery = inputValue.trim();

        if (trimmedQuery) {
            setSearchParams({ q: trimmedQuery });
        } else {
            setSearchParams({});
            dispatch(clearSearch());
        }
    }, [inputValue, setSearchParams, dispatch]);

    const handleClear = useCallback(() => {
        setInputValue('');
        setSearchParams({});
        dispatch(clearSearch());
    }, [setSearchParams, dispatch]);

    return {
        inputValue,
        handleSearch,
        handleClear,
        handleInputChange
    };
}