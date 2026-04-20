import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router";

export function useSearch() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const [searchParams, setSearchParams] = useSearchParams();
    
    const queryFromUrl = searchParams.get('q') || '';

    const [inputValue, setInputValue] = useState(queryFromUrl);

    useEffect(() => {
        setInputValue(queryFromUrl);
    }, [queryFromUrl]);

    useEffect(() => {
        const trimmedQuery = inputValue.trim();

        const timerId = setTimeout(() => {
            if (trimmedQuery === queryFromUrl) return;

            if (trimmedQuery) {
                setSearchParams({ q: trimmedQuery }, { replace: true });
            } else {
                setSearchParams({}, { replace: true });
            }
        }, 300); 

        return () => {
            clearTimeout(timerId);
        };
    }, [inputValue, setSearchParams, queryFromUrl]);

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');
        setSearchParams({});
    }, [setSearchParams]);

    return {
        inputValue,
        handleSearch,
        handleClear,
        isHomePage
    };
}