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
};

export const AdminLayout = () => {
    const user = useAppSelector(selectUser);
    const { pathname } = useLocation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (!user) return null;

    const key = pathname.replace(/\/+$/, '') || '/admin';

    return (
        <>
            <TopBar />
            <PageLayout
                breadcrumbs={isMobile ? undefined : (BREADCRUMBS[key] ?? BREADCRUMBS['/admin'])}
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
