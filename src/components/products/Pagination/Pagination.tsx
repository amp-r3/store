import style from './pagination.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { usePagination, DOTS } from '@/hooks/usePagination';
import { useHaptics, useMediaQuery } from '@/hooks';

interface PaginationProps {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
}: PaginationProps) => {

    const { soft } = useHaptics();
    const isMobile = useMediaQuery('(max-width: 640px)');
    const siblingCount = isMobile ? 0 : 1;

    const { paginationRange, totalPages } = usePagination({
        totalItems,
        currentPage,
        itemsPerPage,
        siblingCount,
    });

    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        if (page === currentPage) return;
        soft();
        onPageChange(page);
    };

    const onPrevious = () => handlePageChange(currentPage - 1);
    const onNext = () => handlePageChange(currentPage + 1);

    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    return (
        <nav className={style.pagination} aria-label="Pagination">

            <button
                className={`${style.pagination__item} ${isFirst ? style['pagination__item--disabled'] : ''}`}
                onClick={onPrevious}
                disabled={isFirst}
                aria-label="Previous page"
            >
                <FaChevronLeft aria-hidden="true" />
            </button>

            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return (
                        <span
                            key={`dots-${index}`}
                            className={style.pagination__dots}
                            aria-hidden="true"
                        >
                            &#8230;
                        </span>
                    );
                }

                const isActive = pageNumber === currentPage;

                return (
                    <button
                        key={pageNumber}
                        className={`${style.pagination__item} ${isActive ? style['pagination__item--active'] : ''}`}
                        onClick={() => handlePageChange(pageNumber)}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={isActive ? 'page' : undefined}
                        disabled={isActive} 
                    >
                        {pageNumber}
                    </button>
                );
            })}

            <button
                className={`${style.pagination__item} ${isLast ? style['pagination__item--disabled'] : ''}`}
                onClick={onNext}
                disabled={isLast}
                aria-label="Next page"
            >
                <FaChevronRight aria-hidden="true" />
            </button>

        </nav>
    );
};