import { useEffect } from 'react';
import { isRangeError } from '../isRangeError';

export function usePaginationBounds(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number,
  setPage: (page: number) => void,
  error?: unknown,
) {
  useEffect(() => {
    if (isRangeError(error)) {
      setPage(1);
      return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [currentPage, totalItems, itemsPerPage, setPage, error]);
}
