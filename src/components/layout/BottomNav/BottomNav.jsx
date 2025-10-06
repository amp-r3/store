import style from './bottomNav.module.scss';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { usePagination, DOTS } from '../../../hooks/usePagination';


const BottomNav = ({ totalItems, currentPage, itemsPerPage, setCurrentPage }) => {
    
    const paginationRange = usePagination({
        totalItems,
        currentPage,
        itemsPerPage,
    })
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);

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