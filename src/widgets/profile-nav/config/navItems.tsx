import type { IconType } from 'react-icons';
import { FaUser, FaBoxOpen, FaStar } from 'react-icons/fa6';
import { IoNotificationsOutline } from 'react-icons/io5';
import { LuShieldCheck } from 'react-icons/lu';

export interface ProfileNavItem {
    id: 'profile' | 'orders' | 'reviews' | 'notifications' | 'admin';
    to: string;
    end?: boolean;
    icon: IconType;
    /** Full label — desktop sidebar. */
    label: string;
    /** Short label — mobile tab, must fit a quarter of a 320px viewport. */
    shortLabel: string;
    /** Only shown to users whose session role is 'admin'. */
    adminOnly?: true;
}

export const PROFILE_NAV_ITEMS: ProfileNavItem[] = [
    { id: 'profile', to: '/user', end: true, icon: FaUser, label: 'Profile', shortLabel: 'Profile' },
    { id: 'orders', to: '/user/orders', icon: FaBoxOpen, label: 'Orders History', shortLabel: 'Orders' },
    { id: 'reviews', to: '/user/reviews', icon: FaStar, label: 'My Reviews', shortLabel: 'Reviews' },
    { id: 'notifications', to: '/user/notifications', icon: IoNotificationsOutline, label: 'Notifications', shortLabel: 'Alerts' },
    { id: 'admin', to: '/admin', icon: LuShieldCheck, label: 'Admin Panel', shortLabel: 'Admin', adminOnly: true },
];
