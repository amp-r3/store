import { memo } from 'react';

import { SessionUser } from '@/entities/session';
import { useGetUnreadNotificationsCountQuery } from '@/entities/notification';
import { useMediaQuery } from '@/shared/lib/hooks';

import { ProfileSidebar } from './ProfileSidebar/ProfileSidebar';
import { ProfileMobileNav } from './ProfileMobileNav/ProfileMobileNav';

const MOBILE_QUERY = '(max-width: 768px)';

interface ProfileNavProps {
    user: SessionUser;
}

export const ProfileNav = memo(({ user }: ProfileNavProps) => {
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const { data: unreadCount } = useGetUnreadNotificationsCountQuery();

    return isMobile
        ? <ProfileMobileNav user={user} unreadCount={unreadCount ?? 0} />
        : <ProfileSidebar user={user} unreadCount={unreadCount ?? 0} />;
});

ProfileNav.displayName = 'ProfileNav';
