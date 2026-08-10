'use client';

import { usePathname } from 'next/navigation';

import { selectUser } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { useMediaQuery } from '@/shared/lib/hooks';
import { PageLayout, HOME_CRUMB, PROFILE_CRUMB, type BreadcrumbItem } from '@/shared/ui';
import { ProfileNav } from '@/widgets/profile-nav';

import { UserLayoutSkeleton } from './UserLayoutSkeleton';
import style from './user-layout.module.scss';

const BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/user': [HOME_CRUMB, { label: 'Profile' }],
  '/user/orders': [HOME_CRUMB, PROFILE_CRUMB, { label: 'Orders' }],
  '/user/reviews': [HOME_CRUMB, PROFILE_CRUMB, { label: 'My Reviews' }],
  '/user/notifications': [HOME_CRUMB, PROFILE_CRUMB, { label: 'Notifications' }],
};

export const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(selectUser);
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!user) return <UserLayoutSkeleton />;

  const key = pathname.replace(/\/+$/, '') || '/user';

  return (
    <PageLayout
      breadcrumbs={isMobile ? undefined : (BREADCRUMBS[key] ?? BREADCRUMBS['/user'])}
      className={style['user-layout']}
    >
      <div className={style['user-layout__grid']}>
        <ProfileNav user={user} />

        <section className={style['user-layout__content']}>{children}</section>
      </div>
    </PageLayout>
  );
};
