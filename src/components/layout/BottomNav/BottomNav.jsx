import { useMemo } from 'react';
import style from './bottomNav.module.scss';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DOTS = '...';

const BottomNav = ({ totalItems, currentPage, itemsPerPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginationRange = useMemo(() => {
        const totalPageNumbers = 4;

        // Случай 1: Если страниц меньше, чем мы хотим отображать, показываем все
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - 1, 1);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        // Случай 2: Показываем многоточие только справа
        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 5;
            let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, DOTS, lastPageIndex];
        }

        // Случай 3: Показываем многоточие только слева
        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 5;
            let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        // Случай 4: Показываем многоточие с обеих сторон
        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = [leftSiblingIndex, currentPage, rightSiblingIndex];
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

    }, [currentPage, totalPages]);


    const onNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const onPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Если страниц всего одна или меньше, компонент не отображается
    if (totalPages <= 1) {
        return null;
    }


    return (
        <nav className={style.pagination} aria-label="Pagination">
            {/* Кнопка "Назад" */}
            <button
                className={`${style.pagination__item} ${currentPage === 1 ? style['pagination__item--disabled'] : ''}`}
                onClick={onPrevious}
                disabled={currentPage === 1}
                aria-label="Previous Page"
            >
                <FaChevronLeft />
            </button>

            {/* Номера страниц */}
            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return <span key={`${DOTS}-${index}`} className={style.pagination__dots}>&#8230;</span>;
                }

                return (
                    <button
                        key={pageNumber}
                        className={`${style.pagination__item} ${pageNumber === currentPage ? style['pagination__item--active'] : ''}`}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                    >
                        {pageNumber}
                    </button>
                );
            })}

            {/* Кнопка "Вперед" */}
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

export default BottomNav;