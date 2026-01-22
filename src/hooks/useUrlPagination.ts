import { useSearchParams } from "react-router";

export function useUrlPagination(defaultPage = 1) {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Safe reading
    const page = Number(searchParams.get('page')) || defaultPage;

    // Convenient recording
    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    return { page, setPage };
}