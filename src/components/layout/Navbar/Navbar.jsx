import { NavLink, Link } from 'react-router-dom';
import style from './navbar.module.scss';
import { IoSearchSharp, IoCartOutline, IoClose } from "react-icons/io5";
import Loader from '../../ui/Loader/Loader';
import useSearch from '../../../hooks/useSearch';

const Navbar = () => {
  const { navRef, handleSearch, searchQuery, isLoading, handleClear, handleInputChange} = useSearch(style);


  return (
    <header className="container">
      <nav ref={navRef} className={style.nav}>
        <Link to="/" className={style.nav__logo}>store</Link>

        <ul className={style.nav__menu}>
          <li>
            <NavLink to="/" className={style.nav__link} end>Main</NavLink>
          </li>
        </ul>
        <form onSubmit={handleSearch} className={style.nav__actions}>
          <button type='button' className={style.nav__cart}>
            <IoCartOutline />
          </button>
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
          <button type='submit' className={style.nav__btn} aria-label="Search" disabled={isLoading}>
            {
              isLoading ? <Loader size={'small'} /> : <IoSearchSharp />
            }
          </button>
        </form>
      </nav>
    </header>
  );
};

export default Navbar;