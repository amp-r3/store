import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router";
import { useAppDispatch } from "@/hooks/redux";

export function useSearch() {
    const dispatch = useAppDispatch();
    const location = useLocation()

    const isHomePage = location.pathname === '/';

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
        }
    }, [inputValue, setSearchParams, dispatch]);

    const handleClear = useCallback(() => {
        setInputValue('');
        setSearchParams({});
    }, [setSearchParams]);

    return {
        inputValue,
        handleSearch,
        handleClear,
        handleInputChange,
        isHomePage
    };
}