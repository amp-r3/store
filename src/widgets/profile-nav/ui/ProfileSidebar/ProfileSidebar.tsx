import { NavLink } from 'react-router';

import { SessionUser } from '@/entities/session';

import type { ProfileNavItem } from '../../config/navItems';
import { getInitial, getDisplayName } from '../../lib/userDisplay';

import style from './profile-sidebar.module.scss';

interface ProfileSidebarProps {
    user: SessionUser;
    unreadCount: number;
    items: ProfileNavItem[];
}

export const ProfileSidebar = ({ user, unreadCount, items }: ProfileSidebarProps) => {
    const hasUnread = unreadCount >= 1;

    return (
        <aside className={style['profile-sidebar']}>
            <NavLink
                to="/user"
                end
                replace
                aria-label="Go to profile"
                className={style['profile-sidebar__user-info']}
            >
                <div className={style['profile-sidebar__avatar']}>
                    {getInitial(user)}
                </div>
                <div className={style['profile-sidebar__details']}>
                    <div className={style['profile-sidebar__name']}>{getDisplayName(user)}</div>
                    {user.email && <div className={style['profile-sidebar__email']}>{user.email}</div>}
                </div>
            </NavLink>

            <nav className={style['profile-sidebar__nav']}>
                {items.map(({ id, to, end, icon: Icon, label }) => {
                    const isNotifications = id === 'notifications';

                    return (
                        <NavLink
                            key={id}
                            to={to}
                            end={end}
                            replace
                            aria-label={isNotifications ? (hasUnread ? `${label}, ${unreadCount} unread` : label) : undefined}
                            className={({ isActive }) => `${style['profile-sidebar__nav-link']} ${isActive ? style['profile-sidebar__nav-link--active'] : ''}`}
                        >
                            <Icon className={style['profile-sidebar__icon']} />
                            <span aria-hidden={isNotifications ? 'true' : undefined}>{label}</span>
                            {isNotifications && hasUnread && (
                                <span className={style['profile-sidebar__badge']} aria-hidden="true">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};
