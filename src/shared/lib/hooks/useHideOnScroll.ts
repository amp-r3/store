import { useCallback, useEffect, useRef } from 'react';

const TOP_THRESHOLD = 50;
const HIDE_THRESHOLD = 24;
const SHOW_THRESHOLD = 12;

export const useHideOnScroll = <T extends HTMLElement>(
    hiddenClass: string,
    forceVisible = false,
): ((node: T | null) => void) => {
    const nodeRef = useRef<T | null>(null);
    const visibleRef = useRef(true);
    const lastYRef = useRef(0);
    const frameRef = useRef<number | null>(null);

    const applyVisible = useCallback((visible: boolean) => {
        if (visibleRef.current === visible) return;
        visibleRef.current = visible;
        nodeRef.current?.classList.toggle(hiddenClass, !visible);
    }, [hiddenClass]);

    const refCallback = useCallback((node: T | null) => {
        nodeRef.current = node;
        if (node) {
            lastYRef.current = window.scrollY;
            node.classList.toggle(hiddenClass, !visibleRef.current);
        }
    }, [hiddenClass]);

    useEffect(() => {
        if (forceVisible) applyVisible(true);
    }, [forceVisible, applyVisible]);

    useEffect(() => {
        const handleScroll = () => {
            if (frameRef.current !== null) return;

            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = null;

                if (forceVisible) return;
                if (document.body.hasAttribute('data-scroll-locked')) return;

                const currentY = window.scrollY;
                if (currentY < 0) return;

                if (currentY < TOP_THRESHOLD) {
                    applyVisible(true);
                    lastYRef.current = currentY;
                    return;
                }

                const delta = currentY - lastYRef.current;

                if (delta > HIDE_THRESHOLD) {
                    applyVisible(false);
                    lastYRef.current = currentY;
                } else if (delta < -SHOW_THRESHOLD) {
                    applyVisible(true);
                    lastYRef.current = currentY;
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        };
    }, [forceVisible, applyVisible]);

    return refCallback;
};
