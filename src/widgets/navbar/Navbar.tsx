import { useRef } from 'react';
// Custom Components
import { Logo } from "@/shared/ui";
import { NavActions } from "@/features/nav-actions";
import { SearchForm } from "@/features/product-search";
import { useSearch } from "@/features/product-search";
// Custom Hooks
import { useNavbarScroll } from "@/shared/lib/hooks";
// Styles
import style from './navbar.module.scss';

interface NavbarProps {
  isOverlay?: boolean;
}

export const Navbar = ({ isOverlay = false }: NavbarProps) => {
  const { handleSearch, inputValue, handleClear, submitSearch } = useSearch();
  const navRef = useRef<HTMLElement>(null);
  useNavbarScroll(navRef);

  return (
    <nav
      ref={navRef}
      className={`${style.nav} ${isOverlay ? style['nav--overlay'] : ''}`}
    >
      <Logo />

      <div className={style.nav__form}>
        <SearchForm
          inputValue={inputValue}
          handleSearch={handleSearch}
          handleClear={handleClear}
          onSubmit={submitSearch}
        />
      </div>

      <div className={style.nav__main_actions}>
        <NavActions />
      </div>
    </nav>
  );
};
