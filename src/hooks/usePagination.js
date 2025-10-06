import { useMemo } from 'react';

export const DOTS = '...';

export const usePagination = ({ totalItems, currentPage, itemsPerPage }) => {
    const paginationRange = useMemo(() => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const totalPageNumbers = 4;

        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - 1, 1);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 5;
            let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, DOTS, lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 5;
            let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = [leftSiblingIndex, currentPage, rightSiblingIndex];
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

        return []; 

    }, [totalItems, currentPage, itemsPerPage]);

    return paginationRange;
};