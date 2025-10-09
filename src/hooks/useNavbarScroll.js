import { useEffect } from "react";

export function useNavbarScroll(navRef) {
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navRef.current.classList.add('scrolled');
            } else {
                navRef.current.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);

    }, []);
}