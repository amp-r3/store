import { useRef } from 'react';

import style from './pagination.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { usePagination, DOTS } from "@/shared/lib/hooks";
import { useHaptics, useElementWidth } from "@/shared/lib/hooks";

interface PaginationProps {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

// Thresholds derived from the pill's own tokens (see pagination.module.scss):
// how many 44px touch targets + gaps + padding fit at a given container width.
// Keep these in sync with the gap/padding values there.
const SIBLINGS_MIN_WIDTH = 496;
const NUMBERED_MIN_WIDTH = 360;

export const Pagination = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
}: PaginationProps) => {

    const { soft } = useHaptics();
    const containerRef = useRef<HTMLDivElement>(null);
    const width = useElementWidth(containerRef);
    const siblingCount = width >= SIBLINGS_MIN_WIDTH ? 1 : 0;
    const isCompact = width > 0 && width < NUMBERED_MIN_WIDTH;

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
        <div ref={containerRef} className={style.pagination}>
            <nav className={style.pagination__bar} aria-label="Pagination">

                <button
                    className={`${style.pagination__item} ${isFirst ? style['pagination__item--disabled'] : ''}`}
                    onClick={onPrevious}
                    disabled={isFirst}
                    aria-label="Previous page"
                >
                    <FaChevronLeft aria-hidden="true" />
                </button>

                {isCompact ? (
                    <span className={style.pagination__status} role="status" aria-live="polite">
                        <span className="sr-only">Page {currentPage} of {totalPages}</span>
                        <span aria-hidden="true">{currentPage} / {totalPages}</span>
                    </span>
                ) : (
                    <div className={style.pagination__pages}>
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
                    </div>
                )}

                <button
                    className={`${style.pagination__item} ${isLast ? style['pagination__item--disabled'] : ''}`}
                    onClick={onNext}
                    disabled={isLast}
                    aria-label="Next page"
                >
                    <FaChevronRight aria-hidden="true" />
                </button>

            </nav>
        </div>
    );
};
