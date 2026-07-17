import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useHaptics } from '@/shared/lib/hooks';
import style from './horizontal-scroll.module.scss';

const SCROLL_EDGE_THRESHOLD = 2;

interface HorizontalScrollProps {
    children: ReactNode;
    ariaLabel?: string;
}

export const HorizontalScroll = ({ children, ariaLabel }: HorizontalScrollProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const { light } = useHaptics();

    const updateScrollState = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;

        setCanScrollLeft(el.scrollLeft > SCROLL_EDGE_THRESHOLD);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE_THRESHOLD);
    }, []);

    // Content (e.g. skeleton -> loaded cards) can shift layout enough to leave
    // a stray sub-pixel scrollLeft, which would incorrectly enable the left arrow.
    useLayoutEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        el.scrollLeft = 0;
    }, [children]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        updateScrollState();

        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);

        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState, children]);

    const scrollByDirection = (direction: 1 | -1) => {
        const el = trackRef.current;
        if (!el) return;

        light();
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollBy({
            left: el.clientWidth * 0.8 * direction,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    };

    return (
        <div className={style.horizontalScroll}>
            <button
                type="button"
                className={style.horizontalScroll__arrow}
                onClick={() => scrollByDirection(-1)}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
            >
                <IoChevronBack aria-hidden="true" />
            </button>

            <div
                ref={trackRef}
                className={style.horizontalScroll__track}
                role="region"
                aria-label={ariaLabel}
                tabIndex={0}
            >
                {children}
            </div>

            <button
                type="button"
                className={style.horizontalScroll__arrow}
                onClick={() => scrollByDirection(1)}
                disabled={!canScrollRight}
                aria-label="Scroll right"
            >
                <IoChevronForward aria-hidden="true" />
            </button>
        </div>
    );
};
