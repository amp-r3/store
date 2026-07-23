import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

export function useSearch() {
    const location = useLocation();
    const navigate = useNavigate();
    const isCatalogPage = location.pathname === '/catalog';
    const [searchParams, setSearchParams] = useSearchParams();

    const queryFromUrl = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(queryFromUrl);

    useEffect(() => {
        setInputValue(queryFromUrl);
    }, [queryFromUrl]);

    useEffect(() => {
        if (!isCatalogPage) return;

        const trimmedQuery = inputValue.trim();

        if (trimmedQuery === queryFromUrl) return;

        const timerId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);

            if (trimmedQuery) {
                params.set('q', trimmedQuery);
            } else {
                params.delete('q');
            }

            setSearchParams(params, { replace: true });
        }, 300);

        return () => clearTimeout(timerId);
    }, [inputValue, queryFromUrl, searchParams, setSearchParams, isCatalogPage]);

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');

        if (!isCatalogPage) return;

        const params = new URLSearchParams(searchParams);
        params.delete('q');
        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams, isCatalogPage]);

    const submitSearch = useCallback(() => {
        if (isCatalogPage) return;

        const trimmedQuery = inputValue.trim();
        if (!trimmedQuery) return;

        navigate(`/catalog?q=${encodeURIComponent(trimmedQuery)}`);
    }, [isCatalogPage, inputValue, navigate]);

    return {
        inputValue,
        handleSearch,
        handleClear,
        submitSearch,
        isCatalogPage
    };
}