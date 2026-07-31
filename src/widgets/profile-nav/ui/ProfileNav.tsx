import { memo, useMemo } from 'react';

import { SessionUser } from '@/entities/session';
import { useGetUnreadNotificationsCountQuery } from '@/entities/notification';
import { useMediaQuery } from '@/shared/lib/hooks';

import { PROFILE_NAV_ITEMS } from '../config/navItems';
import { ProfileSidebar } from './ProfileSidebar/ProfileSidebar';
import { ProfileMobileNav } from './ProfileMobileNav/ProfileMobileNav';

const MOBILE_QUERY = '(max-width: 768px)';

interface ProfileNavProps {
    user: SessionUser;
}

export const ProfileNav = memo(({ user }: ProfileNavProps) => {
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const { data: unreadCount } = useGetUnreadNotificationsCountQuery();

    const items = useMemo(
        () => PROFILE_NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'admin'),
        [user.role]
    );

    return isMobile
        ? <ProfileMobileNav user={user} unreadCount={unreadCount ?? 0} items={items} />
        : <ProfileSidebar user={user} unreadCount={unreadCount ?? 0} items={items} />;
});

ProfileNav.displayName = 'ProfileNav';
