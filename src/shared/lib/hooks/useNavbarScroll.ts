import { useEffect, RefObject } from "react";

export const useNavbarScroll = (navRef: RefObject<HTMLElement | null>): void => {
    useEffect(() => {
        const isScrolledRef = { current: false };
        const frameRef: { current: number | null } = { current: null };

        const applyScrolled = (isScrolled: boolean) => {
            const node = navRef.current;
            if (!node || node.offsetParent === null) return;
            if (isScrolledRef.current === isScrolled) return;

            isScrolledRef.current = isScrolled;
            node.classList.toggle('scrolled', isScrolled);
        };

        const handleScroll = () => {
            if (frameRef.current !== null) return;

            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = null;
                applyScrolled(window.scrollY > 50);
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        applyScrolled(window.scrollY > 50);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        };

    }, [navRef]);
}
