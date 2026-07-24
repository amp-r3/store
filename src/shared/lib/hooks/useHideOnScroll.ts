import { useEffect, useRef, useState } from 'react';

export const useHideOnScroll = (forceVisible = false): boolean => {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (forceVisible) {
                setIsVisible(true);
                return;
            }

            const currentScrollY = window.scrollY;
            const lastY = lastScrollY.current;
            const actionThreshold = 10;

            if (currentScrollY < 0) return;

            if (currentScrollY < 50) {
                setIsVisible(true);
                lastScrollY.current = currentScrollY;
                return;
            }

            if (Math.abs(currentScrollY - lastY) < actionThreshold) return;

            if (currentScrollY > lastY) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [forceVisible]);

    return isVisible;
};
