import { Link, NavLink } from 'react-router';
import { LuArrowLeft, LuUserRound } from 'react-icons/lu';

import { ADMIN_NAV_ITEMS } from '../../config/navItems';

import style from './admin-sidebar.module.scss';

export const AdminSidebar = () => (
    <aside className={style['admin-sidebar']}>
        <div className={style['admin-sidebar__exit-links']}>
            <Link to="/user" className={style['admin-sidebar__back']}>
                <LuUserRound className={style['admin-sidebar__back-icon']} />
                My profile
            </Link>
            <Link to="/" className={style['admin-sidebar__back']}>
                <LuArrowLeft className={style['admin-sidebar__back-icon']} />
                Back to store
            </Link>
        </div>

        <nav className={style['admin-sidebar__nav']}>
            {ADMIN_NAV_ITEMS.map(({ id, to, end, icon: Icon, label }) => (
                <NavLink
                    key={id}
                    to={to}
                    end={end}
                    replace
                    className={({ isActive }) => `${style['admin-sidebar__nav-link']} ${isActive ? style['admin-sidebar__nav-link--active'] : ''}`}
                >
                    <Icon className={style['admin-sidebar__icon']} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    </aside>
);
