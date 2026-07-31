import type { BreadcrumbItem } from './Breadcrumbs';

export const HOME_CRUMB: BreadcrumbItem = { label: 'Home', path: '/' };
export const CATALOG_CRUMB: BreadcrumbItem = { label: 'Catalog', path: '/catalog' };
export const PROFILE_CRUMB: BreadcrumbItem = { label: 'Profile', path: '/user' };
export const ADMIN_CRUMB: BreadcrumbItem = { label: 'Admin', path: '/admin' };

export const categoryCrumb = (name: string, slug?: string): BreadcrumbItem =>
    slug
        ? { label: name, path: `/catalog?category=${encodeURIComponent(slug)}` }
        : { label: name };
