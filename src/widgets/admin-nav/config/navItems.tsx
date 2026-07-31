import type { IconType } from 'react-icons';
import { LuLayoutDashboard, LuClipboardList, LuPackage } from 'react-icons/lu';

export interface AdminNavItem {
    id: 'dashboard' | 'orders' | 'products';
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
];
