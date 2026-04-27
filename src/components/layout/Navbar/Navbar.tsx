import { Link } from 'react-router';
import { useRef } from 'react';
// Icons
import { IoCartOutline } from "react-icons/io5";
import { FaHeart, FaRegHeart } from "react-icons/fa";
// Custom Hooks
import { useHaptics, useNavbarScroll, useSearch } from '@/hooks';
// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// Custom Components
import { SearchForm } from '@/components/common';
import { ThemeToggle } from '@/components/common/ThemeToggle/ThemeToggle';
// Functions and Selectors
import { openCart } from '@/store/slices/cartSlice';
import { selectCartTotalQuantity } from '@/store/selectors/cartSelectors';

// Styles
import style from './navbar.module.scss';

export const Navbar = () => {
  const { handleSearch, inputValue, handleClear, isHomePage } = useSearch();
  const { soft } = useHaptics()
  const navRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const totalQuantity = useAppSelector(selectCartTotalQuantity)
  useNavbarScroll(navRef);

  const isCartLoaded = totalQuantity >= 1

  return (
    <nav ref={navRef} className={style.nav}>
      <Link to={'/'} className={style.nav__logo} aria-label="Store">store</Link>

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