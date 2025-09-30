import { NavLink, Link } from 'react-router';
import style from './navbar.module.scss'
import { IoSearchSharp } from "react-icons/io5";
import { IoMdCart } from "react-icons/io";
import { useEffect, useRef } from 'react';

const Navbar = () => {
  const navRef = useRef(null);

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
        <div className={style.nav__actions}>
          <button className={style.nav__cart}>
            <IoMdCart />
          </button>
          <input
            className={style.nav__search}
            type="text"
            placeholder="Search..."
          />
          <button className={style.nav__btn} aria-label="Search">
            <IoSearchSharp />
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar