import Link from 'next/link';

import { SessionUser } from '@/entities/session';
import { useHaptics, useIsNavActive } from '@/shared/lib/hooks';

import type { ProfileNavItem } from '../../config/navItems';
import { getInitial, getDisplayName } from '../../lib/userDisplay';

import style from './profile-mobile-nav.module.scss';

interface ProfileMobileNavProps {
  user: SessionUser;
  unreadCount: number;
  items: ProfileNavItem[];
}

interface ProfileMobileNavTabProps {
  item: ProfileNavItem;
  unreadCount: number;
  onClick: () => void;
}

const ProfileMobileNavTab = ({
  item: { id, to, end, icon: Icon, shortLabel },
  unreadCount,
  onClick,
}: ProfileMobileNavTabProps) => {
  const isActive = useIsNavActive(to, end);
  const isNotifications = id === 'notifications';
  const hasUnread = unreadCount >= 1;
  const badgeCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <Link
      href={to}
      replace
      aria-label={
        isNotifications
          ? hasUnread
            ? `${shortLabel}, ${unreadCount} unread`
            : shortLabel
          : undefined
      }
      className={`${style['profile-mobile-nav__tab']} ${isActive ? style['profile-mobile-nav__tab--active'] : ''}`}
      onClick={onClick}
    >
      <span className={style['profile-mobile-nav__icon-wrap']}>
        <Icon className={style['profile-mobile-nav__icon']} />
        {isNotifications && hasUnread && (
          <span className={style['profile-mobile-nav__badge']} aria-hidden="true">
            {badgeCount}
          </span>
        )}
      </span>
      <span
        className={style['profile-mobile-nav__label']}
        aria-hidden={isNotifications ? 'true' : undefined}
      >
        {shortLabel}
      </span>
    </Link>
  );
};

export const ProfileMobileNav = ({ user, unreadCount, items }: ProfileMobileNavProps) => {
  const { soft } = useHaptics();

  return (
    <div className={style['profile-mobile-nav']}>
      <Link
        href="/user"
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
      </Link>

      <nav className={style['profile-mobile-nav__tabs']} aria-label="Profile sections">
        {items.map((item) => (
          <ProfileMobileNavTab
            key={item.id}
            item={item}
            unreadCount={unreadCount}
            onClick={() => soft()}
          />
        ))}
      </nav>
    </div>
  );
};
