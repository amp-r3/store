import type { IconType } from 'react-icons';
import { LuLayoutDashboard, LuClipboardList, LuPackage, LuTag, LuUsers, LuStar, LuSettings } from 'react-icons/lu';

export interface AdminNavItem {
    id: 'dashboard' | 'orders' | 'products' | 'categories' | 'customers' | 'reviews' | 'settings' | 'audit';
    to: string;
    end?: boolean;
    icon: IconType;
    /** Full label — desktop sidebar. */
    label: string;
    /** Short label — mobile tab. */
    shortLabel: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    { id: 'dashboard', to: '/admin', end: true, icon: LuLayoutDashboard, label: 'Dashboard', shortLabel: 'Dashboard' },
    { id: 'orders', to: '/admin/orders', icon: LuClipboardList, label: 'Orders', shortLabel: 'Orders' },
    { id: 'products', to: '/admin/products', icon: LuPackage, label: 'Products', shortLabel: 'Products' },
    { id: 'categories', to: '/admin/categories', icon: LuTag, label: 'Categories', shortLabel: 'Categories' },
    { id: 'customers', to: '/admin/customers', icon: LuUsers, label: 'Customers', shortLabel: 'Customers' },
    { id: 'reviews', to: '/admin/reviews', icon: LuStar, label: 'Reviews', shortLabel: 'Reviews' },
    { id: 'settings', to: '/admin/settings', icon: LuSettings, label: 'Settings', shortLabel: 'Settings' },
];
