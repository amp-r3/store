'use client';

import Skeleton from 'react-loading-skeleton';

import { PageLayout } from '@/shared/ui';

import style from './user-layout.module.scss';

/** Shown by ProtectedRoute while redux-persist rehydration is still
 * resolving on a cold /user/* load — replaces what used to be a bare
 * `return null` (blank screen) with a placeholder matching the real grid,
 * so a direct visit/hard refresh doesn't flash empty content. */
export const UserLayoutSkeleton = () => {
  return (
    <PageLayout className={style['user-layout']}>
      <div className={style['user-layout__grid']}>
        <Skeleton height={320} borderRadius={16} />
        <div className={style['user-layout__content']}>
          <Skeleton width={160} height={24} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      </div>
    </PageLayout>
  );
};
