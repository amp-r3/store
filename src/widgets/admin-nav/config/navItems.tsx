import type { IconType } from 'react-icons';
import { LuLayoutDashboard, LuClipboardList, LuPackage, LuTag, LuUsers, LuStar, LuSettings, LuScrollText } from 'react-icons/lu';

export interface AdminNavItem {
    id: 'dashboard' | 'orders' | 'products' | 'categories' | 'customers' | 'reviews' | 'settings' | 'audit';
    to: string;
    end?: boolean;
    icon: IconType;
    label: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    { id: 'dashboard', to: '/admin', end: true, icon: LuLayoutDashboard, label: 'Dashboard' },
    { id: 'orders', to: '/admin/orders', icon: LuClipboardList, label: 'Orders' },
    { id: 'products', to: '/admin/products', icon: LuPackage, label: 'Products' },
    { id: 'categories', to: '/admin/categories', icon: LuTag, label: 'Categories' },
    { id: 'customers', to: '/admin/customers', icon: LuUsers, label: 'Customers' },
    { id: 'reviews', to: '/admin/reviews', icon: LuStar, label: 'Reviews' },
    { id: 'settings', to: '/admin/settings', icon: LuSettings, label: 'Settings' },
    { id: 'audit', to: '/admin/audit', icon: LuScrollText, label: 'Audit log' },
];
