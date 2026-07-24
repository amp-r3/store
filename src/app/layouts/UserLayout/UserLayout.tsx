import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';

import { selectUser } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { Breadcrumbs, Loader, type BreadcrumbItem } from '@/shared/ui';
import { ProfileSidebar } from '@/widgets/profile-sidebar';

import style from './user-layout.module.scss';

const HOME: BreadcrumbItem = { label: 'Home', path: '/' };
const PROFILE: BreadcrumbItem = { label: 'Profile', path: '/user' };

const BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
    '/user': [HOME, { label: 'Profile' }],
    '/user/orders': [HOME, PROFILE, { label: 'Orders' }],
    '/user/reviews': [HOME, PROFILE, { label: 'My Reviews' }],
    '/user/notifications': [HOME, PROFILE, { label: 'Notifications' }],
};

export const UserLayout = () => {
    const user = useAppSelector(selectUser);
    const { pathname } = useLocation();

    if (!user) return null;

    return (
        <main className={`container ${style['user-layout']}`}>
            <div className={style['user-layout__breadcrumbs']}>
                <Breadcrumbs items={BREADCRUMBS[pathname] ?? BREADCRUMBS['/user']} />
            </div>

            <article className={style['user-layout__grid']}>
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
            </article>
        </main>
    );
};
