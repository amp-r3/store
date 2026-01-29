import { SearchForm } from '@/components/ui'
import style from './mobile-bar.module.scss'
import { useSearch } from '@/hooks';
import { useEffect, useState, useRef } from 'react';

const MobileBar = () => {
    const { handleSearch, inputValue, handleClear, handleInputChange, isHomePage } = useSearch();

    const [isVisible, setIsVisible] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (isFocused) {
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
    }, [isFocused]);

    const hiddenClass = (!isVisible || !isHomePage) ? style['navbar--hidden'] : '';

    return (
        <nav className={`${style.navbar} ${hiddenClass}`}>
            <SearchForm
                inputValue={inputValue}
                handleSearch={handleSearch}
                handleInputChange={handleInputChange}
                handleClear={handleClear}
                isHomePage={isHomePage}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </nav>
    )
}

export default MobileBar