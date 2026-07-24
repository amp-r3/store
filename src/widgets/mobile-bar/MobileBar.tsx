import { useEffect, useState } from 'react';
import { IoSearchOutline, IoArrowBackOutline } from 'react-icons/io5';
import style from './mobile-bar.module.scss';
import { useSearch, SearchForm } from "@/features/product-search";
import { NavActions } from "@/features/nav-actions";
import { useHideOnScroll } from "@/shared/lib/hooks";

export const MobileBar = () => {
    const { handleSearch, inputValue, handleClear, submitSearch } = useSearch();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const isVisible = useHideOnScroll(isSearchOpen);

    const closeSearch = () => setIsSearchOpen(false);

    const handleSubmit = () => {
        submitSearch();
        closeSearch();
    };

    useEffect(() => {
        if (!isSearchOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeSearch();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen]);

    const hiddenClass = !isVisible ? style['navbar--hidden'] : '';
    const expandedClass = isSearchOpen ? style['navbar--expanded'] : '';

    return (
        <>
            <nav className={`${style.navbar} ${hiddenClass} ${expandedClass}`}>
                {isSearchOpen ? (
                    <>
                        <button
                            type="button"
                            className={style.navbar__back}
                            aria-label="Close search"
                            onClick={closeSearch}
                        >
                            <IoArrowBackOutline />
                        </button>
                        <SearchForm
                            inputValue={inputValue}
                            handleSearch={handleSearch}
                            handleClear={handleClear}
                            onSubmit={handleSubmit}
                            autoFocus
                        />
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className={style.navbar__trigger}
                            aria-label="Open search"
                            aria-expanded={false}
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <IoSearchOutline />
                        </button>
                        <NavActions variant="mobile" />
                    </>
                )}
            </nav>
            {
                isSearchOpen &&
                <div className={style.navbar__backdrop} onClick={closeSearch}></div>
            }
        </>
    )
}
