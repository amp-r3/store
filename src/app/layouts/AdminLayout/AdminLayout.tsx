import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';

import { selectUser } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { useMediaQuery } from '@/shared/lib/hooks';
import { Loader, PageLayout, HOME_CRUMB, ADMIN_CRUMB, type BreadcrumbItem } from '@/shared/ui';
import { TopBar } from '@/widgets/top-bar';
import { AdminNav } from '@/widgets/admin-nav';

import style from './admin-layout.module.scss';

const BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
    '/admin': [HOME_CRUMB, { label: 'Admin' }],
    '/admin/orders': [HOME_CRUMB, ADMIN_CRUMB, { label: 'Orders' }],
    '/admin/products': [HOME_CRUMB, ADMIN_CRUMB, { label: 'Products' }],
    '/admin/categories': [HOME_CRUMB, ADMIN_CRUMB, { label: 'Categories' }],
    '/admin/customers': [HOME_CRUMB, ADMIN_CRUMB, { label: 'Customers' }],
    '/admin/reviews': [HOME_CRUMB, ADMIN_CRUMB, { label: 'Reviews' }],
    '/admin/settings': [HOME_CRUMB, ADMIN_CRUMB, { label: 'Settings' }],
};

const PRODUCTS_CRUMB: BreadcrumbItem = { label: 'Products', path: '/admin/products' };

// Most admin routes are static, so an exact-pathname lookup covers them —
// but /admin/products/:id/edit has a dynamic segment, which a plain Record
// can't key on. Those get a couple of prefix rules on top of the same table.
const resolveBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const key = pathname.replace(/\/+$/, '') || '/admin';

    if (BREADCRUMBS[key]) return BREADCRUMBS[key];
    if (key === '/admin/products/new') return [HOME_CRUMB, ADMIN_CRUMB, PRODUCTS_CRUMB, { label: 'New product' }];
    if (key === '/admin/products/low-stock') return [HOME_CRUMB, ADMIN_CRUMB, PRODUCTS_CRUMB, { label: 'Low stock' }];
    if (/^\/admin\/products\/[^/]+\/edit$/.test(key)) return [HOME_CRUMB, ADMIN_CRUMB, PRODUCTS_CRUMB, { label: 'Edit product' }];

    return BREADCRUMBS['/admin'];
};

export const AdminLayout = () => {
    const user = useAppSelector(selectUser);
    const { pathname } = useLocation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (!user) return null;

    return (
        <>
            <TopBar />
            <PageLayout
                breadcrumbs={isMobile ? undefined : resolveBreadcrumbs(pathname)}
                className={style['admin-layout']}
            >
                <div className={style['admin-layout__grid']}>
                    <AdminNav />

                    <section className={style['admin-layout__content']}>
                        <Suspense
                            fallback={
                                <div className={style['admin-layout__fallback']}>
                                    <Loader size="md" />
                                </div>
                            }
                        >
                            <Outlet />
                        </Suspense>
                    </section>
                </div>
            </PageLayout>
        </>
    );
};
