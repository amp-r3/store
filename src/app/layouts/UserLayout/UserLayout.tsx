import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';

import { selectUser } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { useMediaQuery } from '@/shared/lib/hooks';
import { Loader, PageLayout, HOME_CRUMB, PROFILE_CRUMB, type BreadcrumbItem } from '@/shared/ui';
import { ProfileNav } from '@/widgets/profile-nav';

import style from './user-layout.module.scss';

const BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
    '/user': [HOME_CRUMB, { label: 'Profile' }],
    '/user/orders': [HOME_CRUMB, PROFILE_CRUMB, { label: 'Orders' }],
    '/user/reviews': [HOME_CRUMB, PROFILE_CRUMB, { label: 'My Reviews' }],
    '/user/notifications': [HOME_CRUMB, PROFILE_CRUMB, { label: 'Notifications' }],
};

export const UserLayout = () => {
    const user = useAppSelector(selectUser);
    const { pathname } = useLocation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (!user) return null;

    const key = pathname.replace(/\/+$/, '') || '/user';

    return (
        <PageLayout
            breadcrumbs={isMobile ? undefined : (BREADCRUMBS[key] ?? BREADCRUMBS['/user'])}
            className={style['user-layout']}
        >
            <div className={style['user-layout__grid']}>
                <ProfileNav user={user} />

                <section className={style['user-layout__content']}>
                    <Suspense
                        fallback={
                            <div className={style['user-layout__fallback']}>
                                <Loader size="md" />
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </section>
            </div>
        </PageLayout>
    );
};
