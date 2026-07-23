import { Link } from 'react-router';
import { useRef } from 'react';
// Icons
import { IoCartOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { FaArrowRightToBracket, FaUser } from "react-icons/fa6";
// Custom Hooks
// Redux Hooks
// Custom Components
// Functions and Selectors
import { openCart } from '@/entities/cart';
import { selectIsAuth } from '@/entities/session';

// Styles
import style from './navbar.module.scss';
import { Logo } from "@/shared/ui";
import { useCartDetails } from "@/entities/cart";
import { useSearch } from "@/features/product-search";
import { useWishlistDetails } from "@/entities/wishlist";
import { useHaptics, useNavbarScroll } from "@/shared/lib/hooks";
import { useAppDispatch, useAppSelector } from "@/shared/model";
import { SearchForm } from "@/features/product-search";

interface NavbarProps {
  isOverlay?: boolean;
}

export const Navbar = ({ isOverlay = false }: NavbarProps) => {
  const { handleSearch, inputValue, handleClear, submitSearch } = useSearch();
  const { soft } = useHaptics()
  const navRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);
  const { totalQuantity: cartTotals } = useCartDetails()
  const { totalQuantity: wishlistTotals } = useWishlistDetails()
  useNavbarScroll(navRef);

  const isCartLoaded = (cartTotals ?? 0) >= 1
  const isWishlistLoaded = (wishlistTotals ?? 0) >= 1

  return (
    <nav ref={navRef} className={`${style.nav} ${isOverlay ? style['nav--overlay'] : ''}`}>
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

        <Link to={'/wishlist'} aria-label='open wishlist' className={style.nav__btn}>
          {
            isWishlistLoaded && <span className={style.nav__btn__count}>{wishlistTotals}</span>
          }
          <FaRegHeart />
        </Link>

        <button onClick={() => { dispatch(openCart()); soft() }} type='button' aria-label='open cart' className={style.nav__btn}>
          {
            isCartLoaded && <span className={style.nav__btn__count}>{cartTotals}</span>
          }
          <IoCartOutline />
        </button>

        {isAuth ? (
          <Link to={'/user'} aria-label='open profile' className={style.nav__btn}>
            <FaUser />
          </Link>
        ) : (
          <Link to={'/login'} aria-label='sign in' className={style.nav__btn}>
            <FaArrowRightToBracket />
          </Link>
        )}

      </div>
    </nav>
  );
};