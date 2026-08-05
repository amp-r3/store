import { ADMIN_NAV_ITEMS, type AdminNavItem } from '../config/navItems';

// Most nav items own an exact route, but Products also covers routes with no
// tab of their own (/admin/products/new, /products/low-stock, /products/:id/edit)
// — a prefix match on non-`end` items covers all three without listing them.
export const resolveActiveNavItem = (pathname: string): AdminNavItem => {
    const path = pathname.replace(/\/+$/, '') || '/admin';
    const match = ADMIN_NAV_ITEMS.find(({ to, end }) => (end ? path === to : path === to || path.startsWith(`${to}/`)));

    return match ?? ADMIN_NAV_ITEMS[0];
};
