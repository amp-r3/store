import { SearchForm } from '@/components/ui'
import style from './mobile-bar.module.scss'
import { useSearch } from '@/hooks';
import { useEffect, useState } from 'react';

const MobileBar = () => {
    const { handleSearch, inputValue, handleClear, handleInputChange, isHomePage } = useSearch();

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    return (
        <nav className={`${style.navbar} ${!isVisible ? style['navbar--hidden'] : ''}`}>
            <SearchForm
                inputValue={inputValue}
                handleSearch={handleSearch}
                handleInputChange={handleInputChange}
                handleClear={handleClear}
                isHomePage={isHomePage}
            />
        </nav>
    )
}

export default MobileBar