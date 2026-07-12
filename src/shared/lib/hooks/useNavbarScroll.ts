import { useEffect, RefObject } from "react";

export const useNavbarScroll = (navRef: RefObject<HTMLElement | null>): void => {
    useEffect(() => {
        const handleScroll = () => {
            if (navRef.current) {
                if (window.scrollY > 50) {
                    navRef.current.classList.add('scrolled');
                } else {
                    navRef.current.classList.remove('scrolled');
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);

    }, [navRef]);
}