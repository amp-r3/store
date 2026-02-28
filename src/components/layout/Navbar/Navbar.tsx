import { NavLink, Link } from 'react-router';
import { useRef } from 'react';
// Icons
import { IoCartOutline, IoHome } from "react-icons/io5";
// Custom Hooks
import { useNavbarScroll, useSearch } from '@/hooks';
// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// Custom Components
import { SearchForm } from '@/components/common';
// Functions and Selectors
import { openCart } from '@/store/slices/cartSlice';
import { selectCartTotalQuantity } from '@/store/selectors/cartSelectors';

// Styles
import style from './navbar.module.scss';

export const Navbar = () => {
  const { handleSearch, inputValue, handleClear, handleInputChange, isHomePage } = useSearch();
  const navRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const totalQuantity = useAppSelector(selectCartTotalQuantity)
  useNavbarScroll(navRef);

  const isCartLoaded = totalQuantity >= 1



  return (
      <nav ref={navRef} className={style.nav}>
        <span className={style.nav__logo} aria-label="">store</span>
        <div className={style.nav__form}>
          <SearchForm
            inputValue={inputValue}
            handleSearch={handleSearch}
            handleInputChange={handleInputChange}
            handleClear={handleClear}
            isHomePage={isHomePage}
          />
        </div>
        <div className={style.nav__main_actions}>
          <ul className={style.nav__menu}>
            <li>
              <NavLink to="/" className={style.nav__link} end  aria-label='Back to catalog'><IoHome /></NavLink>
            </li>
          </ul>
          <button onClick={() => { dispatch(openCart()) }} type='button' aria-label='open cart' className={style.nav__cart}>
            {
              isCartLoaded && <span className={style.nav__cart__count}>{totalQuantity}</span>
            }
            <IoCartOutline />
          </button>
        </div>
      </nav>
  );
};