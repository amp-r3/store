import { useMemo } from 'react';

export const DOTS = '...' as const;

type Dots = typeof DOTS;
type PaginationItem = number | Dots;

interface UsePaginationProps {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    siblingCount?: number;
}

interface UsePaginationResult {
    paginationRange: PaginationItem[];
    totalPages: number;
}

const FIXED_SLOT_COUNT = 5;

const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

export const usePagination = ({
    totalItems,
    currentPage,
    itemsPerPage,
    siblingCount = 1,
}: UsePaginationProps): UsePaginationResult => {

    const totalPages = useMemo(() => {
        if (totalItems <= 0 || itemsPerPage <= 0) return 0;
        return Math.ceil(totalItems / itemsPerPage);
    }, [totalItems, itemsPerPage]);

    const paginationRange = useMemo((): PaginationItem[] => {
        if (totalPages <= 0) return [];
        if (totalPages === 1) return [1];

        const totalSlots = siblingCount * 2 + FIXED_SLOT_COUNT;

        if (totalSlots >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblingCount;
            return [...range(1, leftItemCount), DOTS, totalPages];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblingCount;
            return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)];
        }

        return [1, DOTS, ...range(leftSiblingIndex, rightSiblingIndex), DOTS, totalPages];

    }, [totalPages, currentPage, siblingCount]);

    return { paginationRange, totalPages };
};