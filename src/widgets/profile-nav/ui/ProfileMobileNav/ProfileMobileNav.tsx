import { NavLink } from 'react-router';

import { SessionUser } from '@/entities/session';
import { useHaptics } from '@/shared/lib/hooks';

import { PROFILE_NAV_ITEMS } from '../../config/navItems';
import { getInitial, getDisplayName } from '../../lib/userDisplay';

import style from './profile-mobile-nav.module.scss';

interface ProfileMobileNavProps {
    user: SessionUser;
    unreadCount: number;
}

export const ProfileMobileNav = ({ user, unreadCount }: ProfileMobileNavProps) => {
    const { soft } = useHaptics();
    const hasUnread = unreadCount >= 1;

    return (
        <div className={style['profile-mobile-nav']}>
            <NavLink
                to="/user"
                end
                replace
                aria-label="Go to profile"
                className={style['profile-mobile-nav__identity']}
                onClick={() => soft()}
            >
                <div className={style['profile-mobile-nav__avatar']} aria-hidden="true">
                    {getInitial(user)}
                </div>
                <div className={style['profile-mobile-nav__details']}>
                    <span className={style['profile-mobile-nav__name']}>{getDisplayName(user)}</span>
                    {user.email && <span className={style['profile-mobile-nav__email']}>{user.email}</span>}
                </div>
            </NavLink>

            <nav className={style['profile-mobile-nav__tabs']} aria-label="Profile sections">
                {PROFILE_NAV_ITEMS.map(({ id, to, end, icon: Icon, shortLabel }) => {
                    const isNotifications = id === 'notifications';
                    const badgeCount = unreadCount > 9 ? '9+' : unreadCount;

                    return (
                        <NavLink
                            key={id}
                            to={to}
                            end={end}
                            replace
                            aria-label={isNotifications ? (hasUnread ? `${shortLabel}, ${unreadCount} unread` : shortLabel) : undefined}
                            className={({ isActive }) => `${style['profile-mobile-nav__tab']} ${isActive ? style['profile-mobile-nav__tab--active'] : ''}`}
                            onClick={() => soft()}
                        >
                            <span className={style['profile-mobile-nav__icon-wrap']}>
                                <Icon className={style['profile-mobile-nav__icon']} />
                                {isNotifications && hasUnread && (
                                    <span className={style['profile-mobile-nav__badge']} aria-hidden="true">
                                        {badgeCount}
                                    </span>
                                )}
                            </span>
                            <span className={style['profile-mobile-nav__label']} aria-hidden={isNotifications ? 'true' : undefined}>{shortLabel}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};
