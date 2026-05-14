import { Link } from 'react-router';
import { useRef } from 'react';
// Icons
import { IoCartOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
// Custom Hooks
import { useCartDetails, useHaptics, useNavbarScroll, useSearch } from '@/hooks';
// Redux Hooks
import { useAppDispatch, } from '@/hooks';
// Custom Components
import { Logo, SearchForm, ThemeToggle } from '@/components/common';
// Functions and Selectors
import { openCart } from '@/store/slices/cartSlice';

// Styles
import style from './navbar.module.scss';

export const Navbar = () => {
  const { handleSearch, inputValue, handleClear, isHomePage } = useSearch();
  const { soft } = useHaptics()
  const navRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { totalQuantity } = useCartDetails()
  useNavbarScroll(navRef);

  const isCartLoaded = totalQuantity >= 1

  return (
    <nav ref={navRef} className={style.nav}>
      <Logo />

      <div className={style.nav__form}>
        <SearchForm
          inputValue={inputValue}
          handleSearch={handleSearch}
          handleClear={handleClear}
          isHomePage={isHomePage}
        />
      </div>

      <div className={style.nav__main_actions}>
        <ThemeToggle />

        <Link to={'/wishlist'} aria-label='open wishlist' className={style.nav__btn}>
          <FaRegHeart />
        </Link>

        <button onClick={() => { dispatch(openCart()); soft() }} type='button' aria-label='open cart' className={style.nav__btn}>
          {
            isCartLoaded && <span className={style.nav__btn__count}>{totalQuantity}</span>
          }
          <IoCartOutline />
        </button>

      </div>
    </nav>
  );
};