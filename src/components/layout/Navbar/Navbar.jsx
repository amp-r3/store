import { NavLink, Link } from 'react-router-dom';
// Icons
import { IoSearchSharp, IoCartOutline, IoClose, IoHome } from "react-icons/io5";
// Components
import { Loader } from '@/components/ui'
// Custom Hooks
import { useMediaQuery, useNavbarScroll, useSearch } from '@/hooks';
// Styles
import style from './navbar.module.scss';

const Navbar = () => {
  const { navRef, handleSearch, searchQuery, isLoading, handleClear, handleInputChange, isSearchActive, handleSearchActive } = useSearch();
  useNavbarScroll(navRef);
  const isMobile = useMediaQuery('(max-width: 460px)')
  console.log(isMobile);

  return (
    <header className="container">
      <nav ref={navRef} className={`${style.nav} ${isSearchActive ? style.searchActive : ''}`}>
        <Link to="/" className={style.nav__logo}>store</Link>
        <form onSubmit={handleSearch} className={style.nav__search_form}>
          <div className={style.nav__searchContainer}>
            <input
              className={style.nav__search}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="button"
              className={`${style.nav__clearBtn} ${searchQuery ? style.visible : ''}`}
              onClick={handleClear}
              aria-label="Clear search"
            >
              <IoClose />
            </button>
          </div>
          <button
            type='submit'
            className={style.nav__searchBtn}
            aria-label="Search"
            disabled={isLoading}
            onClick={handleSearchActive}>
            {
              isLoading ? (
                <Loader size={'small'} />
              ) : isSearchActive && isMobile ? (
                <IoClose />
              ) : (
                <IoSearchSharp />
              )
            }
          </button>
        </form>
        <div className={style.nav__main_actions}>
          <ul className={style.nav__menu}>
            <li>
              <NavLink to="/" className={style.nav__link} end><IoHome /></NavLink>
            </li>
          </ul>
          <button type='button' className={style.nav__cart}>
            <IoCartOutline />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;