import { useEffect } from "react";

export function useScrollEffect(style, navRef) {
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navRef.current.classList.add(style.scrolled);
            } else {
                navRef.current.classList.remove(style.scrolled);
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);

    }, []);
}