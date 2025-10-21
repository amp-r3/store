import style from './pagination.module.scss';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { usePagination, DOTS } from '@/hooks/usePagination';
import { useMediaQuery } from '@/hooks';


const Pagination = ({ totalItems, currentPage, itemsPerPage, onPageChange }) => {

    const isMobile = useMediaQuery('(max-width: 640px)')

    const siblingCount = isMobile ? 0 : 1;

    const paginationRange = usePagination({
        totalItems,
        currentPage,
        itemsPerPage,
        siblingCount,
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const onNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const onPrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    // If there is only one or fewer pages, the component is not displayed.
    if (totalPages <= 1) {
        return null;
    }


    return (
        <nav className={style.pagination} aria-label="Pagination">
            {/* Back button" */}
            <button
                className={`${style.pagination__item} ${currentPage === 1 ? style['pagination__item--disabled'] : ''}`}
                onClick={onPrevious}
                disabled={currentPage === 1}
                aria-label="Previous Page"
            >
                <FaChevronLeft />
            </button>

            {/* Numbers of pages */}
            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return <span key={`${DOTS}-${index}`} className={style.pagination__dots}>&#8230;</span>;
                }

                return (
                    <button
                        key={pageNumber}
                        className={`${style.pagination__item} ${pageNumber === currentPage ? style['pagination__item--active'] : ''}`}
                        onClick={() => onPageChange(pageNumber)}
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                    >
                        {pageNumber}
                    </button>
                );
            })}

            {/* Next button*/}
            <button
                className={`${style.pagination__item} ${currentPage === totalPages ? style['pagination__item--disabled'] : ''}`}
                onClick={onNext}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
            >
                <FaChevronRight />
            </button>
        </nav>
    );
};

export default Pagination;