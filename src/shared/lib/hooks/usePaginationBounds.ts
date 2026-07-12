import { useEffect } from 'react';

export function usePaginationBounds(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number,
  setPage: (page: number) => void,
  error?: any
) {
  useEffect(() => {
    const isRangeError = error && (
      error.status === 'PGRST103' ||
      error.status === 416
    );

    if (isRangeError) {
      setPage(1);
      return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [currentPage, totalItems, itemsPerPage, setPage, error]);
}