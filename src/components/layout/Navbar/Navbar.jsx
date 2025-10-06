import { NavLink, Link, useNavigate } from 'react-router-dom';
import style from './navbar.module.scss';
import { IoSearchSharp, IoCartOutline, IoClose } from "react-icons/io5";
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../ui/Loader/Loader';
import { clearSearch, getProductsBySearch } from '../../../store/features/productsSlice';

const Navbar = () => {
  const navRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchStatus } = useSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navRef.current.classList.add(style.scrolled);
      } else {
        navRef.current.classList.remove(style.scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLoading = searchStatus === 'loading';

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    dispatch(getProductsBySearch(searchQuery));
    navigate('/');
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      dispatch(clearSearch());
    }
  }, [searchQuery, dispatch]);

  return (
    <header className="container">
      <nav ref={navRef} className={style.nav}>
        <Link to="/" className={style.nav__logo}>
          store
        </Link>

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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className={`${style.nav__clearBtn} ${searchQuery ? style.visible : ''}`}
              onClick={()=>{setSearchQuery('')}}
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