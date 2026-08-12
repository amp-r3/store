import { memo } from 'react';
import Link from 'next/link';

import { SessionUser } from '@/entities/session';
import { useIsNavActive } from '@/shared/lib/hooks';

import type { ProfileNavItem } from '../../config/navItems';
import { getInitial, getDisplayName } from '../../lib/userDisplay';

import style from './profile-sidebar.module.scss';

interface ProfileSidebarProps {
  user: SessionUser;
  unreadCount: number;
  items: ProfileNavItem[];
}

interface ProfileSidebarLinkProps {
  item: ProfileNavItem;
  unreadCount: number;
}

const ProfileSidebarLink = memo<ProfileSidebarLinkProps>(
  ({ item: { id, to, end, icon: Icon, label }, unreadCount }) => {
    const isActive = useIsNavActive(to, end);
    const isNotifications = id === 'notifications';
    const hasUnread = unreadCount >= 1;

    return (
      <Link
        href={to}
        replace
        aria-label={
          isNotifications ? (hasUnread ? `${label}, ${unreadCount} unread` : label) : undefined
        }
        aria-current={isActive ? 'page' : undefined}
        className={`${style['profile-sidebar__nav-link']} ${isActive ? style['profile-sidebar__nav-link--active'] : ''}`}
      >
        <Icon className={style['profile-sidebar__icon']} />
        <span aria-hidden={isNotifications ? 'true' : undefined}>{label}</span>
        {isNotifications && hasUnread && (
          <span className={style['profile-sidebar__badge']} aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    );
  },
);

ProfileSidebarLink.displayName = 'ProfileSidebarLink';

export const ProfileSidebar = ({ user, unreadCount, items }: ProfileSidebarProps) => {
  return (
    <aside className={style['profile-sidebar']}>
      <Link
        href="/user"
        replace
        aria-label="Go to profile"
        className={style['profile-sidebar__user-info']}
      >
        <div className={style['profile-sidebar__avatar']}>{getInitial(user)}</div>
        <div className={style['profile-sidebar__details']}>
          <div className={style['profile-sidebar__name']}>{getDisplayName(user)}</div>
          {user.email && <div className={style['profile-sidebar__email']}>{user.email}</div>}
        </div>
      </Link>

      <nav className={style['profile-sidebar__nav']} aria-label="Profile sections">
        {items.map((item) => (
          <ProfileSidebarLink key={item.id} item={item} unreadCount={unreadCount} />
        ))}
      </nav>
    </aside>
  );
};
