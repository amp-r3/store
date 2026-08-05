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

// Geometry mirrors pagination.module.scss: .pagination__item is a
// $touch-target-min square, .pagination__bar adds inline padding + a 1.5px
// border, prev/next sit outside the numbered row.
const ITEM_SIZE = 44;   // $touch-target-min
const BORDER = 1.5;
const GAP = 8;          // $spacing-xs
const GAP_TIGHT = 4;    // $spacing-xxs
const PAD_X = 16;       // $spacing-md
const PAD_X_TIGHT = 12; // $spacing-sm
// Headroom for subpixel rounding and larger system font scaling — without
// it the fit computed here lands exactly at the edge, and any 1px drift
// turns back into overflow.
const SAFETY = 8;

/** How many numbered slots fit in `width` given a gap/padding pairing. */
const slotsThatFit = (width: number, gap: number, padX: number): number => {
    // prev + gap + [n slots separated by gap] + gap + next, plus the bar's padding and border
    const fixed = padX * 2 + BORDER * 2 + ITEM_SIZE * 2 + gap * 2 + SAFETY;
    return Math.floor((width - fixed + gap) / (ITEM_SIZE + gap));
};

export const Pagination = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
}: PaginationProps) => {

    const { soft } = useHaptics();
    const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();

    const roomySlots = slotsThatFit(width, GAP, PAD_X);
    const tightSlots = slotsThatFit(width, GAP_TIGHT, PAD_X_TIGHT);
    const siblingCount = Math.max(roomySlots, tightSlots) >= 7 ? 1 : 0;

    const { paginationRange, totalPages } = usePagination({
        totalItems,
        currentPage,
        itemsPerPage,
        siblingCount,
    });

    if (totalPages <= 1) return null;

    // paginationRange.length is the exact slot count that will render
    // (usePagination collapses the range itself when there are fewer pages
    // than slots), so fit is checked against it rather than a hardcoded 5/7.
    const neededSlots = paginationRange.length;
    // width === 0 means not measured yet — default to the compact view,
    // since it can't overflow any container.
    const isCompact = width === 0 || tightSlots < neededSlots;
    const isTight = !isCompact && roomySlots < neededSlots;

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
            <nav
                className={`${style.pagination__bar} ${isTight ? style['pagination__bar--tight'] : ''}`}
                aria-label="Pagination"
            >

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
                    <div className={`${style.pagination__pages} ${isTight ? style['pagination__pages--tight'] : ''}`}>
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
