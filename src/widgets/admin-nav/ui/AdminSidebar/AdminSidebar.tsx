import Link from 'next/link';
import { LuArrowLeft, LuUserRound } from 'react-icons/lu';

import { useIsNavActive } from '@/shared/lib/hooks';

import { ADMIN_NAV_ITEMS, type AdminNavItem } from '../../config/navItems';

import style from './admin-sidebar.module.scss';

const AdminSidebarNavLink = ({ to, end, icon: Icon, label }: AdminNavItem) => {
    const isActive = useIsNavActive(to, end);

    return (
        <Link
            href={to}
            replace
            className={`${style['admin-sidebar__nav-link']} ${isActive ? style['admin-sidebar__nav-link--active'] : ''}`}
        >
            <Icon className={style['admin-sidebar__icon']} />
            <span>{label}</span>
        </Link>
    );
};

export const AdminSidebar = () => (
    <aside className={style['admin-sidebar']}>
        <div className={style['admin-sidebar__exit-links']}>
            <Link href="/user" className={style['admin-sidebar__back']}>
                <LuUserRound className={style['admin-sidebar__back-icon']} />
                My profile
            </Link>
            <Link href="/" className={style['admin-sidebar__back']}>
                <LuArrowLeft className={style['admin-sidebar__back-icon']} />
                Back to store
            </Link>
        </div>

        <nav className={style['admin-sidebar__nav']}>
            {ADMIN_NAV_ITEMS.map((item) => (
                <AdminSidebarNavLink key={item.id} {...item} />
            ))}
        </nav>
    </aside>
);
