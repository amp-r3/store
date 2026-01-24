import { NavLink, Link } from 'react-router';
import { useRef, useState } from 'react';
// Icons
import { IoCartOutline, IoHome } from "react-icons/io5";
// Custom Hooks
import { useNavbarScroll, useSearch } from '@/hooks';
// Custom Components
import { SearchForm } from '@/components/ui';
// Styles
import style from './navbar.module.scss';
import { useAppDispatch } from '@/store/hook';
import { openCart } from '@/features/cart/store/cartSlice';

const Navbar = () => {
  const { handleSearch, inputValue, handleClear, handleInputChange, isHomePage  } = useSearch();
  const navRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch()
  useNavbarScroll(navRef);
  const [isActive, setIsSearchActive] = useState(false);


  const toggleSearch = () => {
    if (isActive && !inputValue) {
      setIsSearchActive(false);
    } else {
      setIsSearchActive(true);
    }
  };

  return (
    <header className="container">
      <nav ref={navRef} className={`${style.nav} ${isActive ? style.searchActive : ''}`}>
        <Link to="/" className={style.nav__logo}>store</Link>
        <SearchForm
          inputValue={inputValue}
          handleSearch={handleSearch}
          handleInputChange={handleInputChange}
          handleClear={handleClear}
          toggleSearch={toggleSearch}
          isActive={isActive}
          isHomePage={isHomePage}
        />
        <div className={style.nav__main_actions}>
          <ul className={style.nav__menu}>
            <li>
              <NavLink to="/" className={style.nav__link} end><IoHome /></NavLink>
            </li>
          </ul>
          <button onClick={()=>{ dispatch(openCart()) }} role='button' className={style.nav__cart}>
            <IoCartOutline />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;