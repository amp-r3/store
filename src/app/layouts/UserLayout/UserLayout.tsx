import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';

import { selectUser } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { Loader, PageLayout, HOME_CRUMB, PROFILE_CRUMB, type BreadcrumbItem } from '@/shared/ui';
import { ProfileSidebar } from '@/widgets/profile-sidebar';

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

    if (!user) return null;

    const key = pathname.replace(/\/+$/, '') || '/user';

    return (
        <PageLayout
            breadcrumbs={BREADCRUMBS[key] ?? BREADCRUMBS['/user']}
            className={style['user-layout']}
        >
            <div className={style['user-layout__grid']}>
                <ProfileSidebar user={user} />

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
