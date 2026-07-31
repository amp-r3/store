import { Link, NavLink } from 'react-router';
import { LuArrowLeft, LuUserRound } from 'react-icons/lu';

import { useHaptics } from '@/shared/lib/hooks';

import { ADMIN_NAV_ITEMS } from '../../config/navItems';

import style from './admin-mobile-nav.module.scss';

export const AdminMobileNav = () => {
    const { soft } = useHaptics();

    return (
        <div className={style['admin-mobile-nav']}>
            <div className={style['admin-mobile-nav__exit-links']}>
                <Link to="/user" className={style['admin-mobile-nav__back']} onClick={() => soft()}>
                    <LuUserRound className={style['admin-mobile-nav__back-icon']} />
                    <span className={style['admin-mobile-nav__back-label']}>My profile</span>
                </Link>
                <Link to="/" className={style['admin-mobile-nav__back']} onClick={() => soft()}>
                    <LuArrowLeft className={style['admin-mobile-nav__back-icon']} />
                    <span className={style['admin-mobile-nav__back-label']}>Back to store</span>
                </Link>
            </div>

            <nav className={style['admin-mobile-nav__tabs']} aria-label="Admin sections">
                {ADMIN_NAV_ITEMS.map(({ id, to, end, icon: Icon, shortLabel }) => (
                    <NavLink
                        key={id}
                        to={to}
                        end={end}
                        replace
                        className={({ isActive }) => `${style['admin-mobile-nav__tab']} ${isActive ? style['admin-mobile-nav__tab--active'] : ''}`}
                        onClick={() => soft()}
                    >
                        <Icon className={style['admin-mobile-nav__icon']} />
                        <span className={style['admin-mobile-nav__label']}>{shortLabel}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};
