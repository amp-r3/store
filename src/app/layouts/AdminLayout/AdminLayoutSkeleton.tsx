'use client';

import Skeleton from 'react-loading-skeleton';

import { PageLayout } from '@/shared/ui';
import { TopBar } from '@/widgets/top-bar';

import style from './admin-layout.module.scss';

/** Shown by AdminRoute while redux-persist rehydration or the session-role
 * fetch is still resolving on a cold /admin/* load — replaces what used to
 * be a bare `return null` (blank screen) / full-page spinner with a
 * placeholder matching the real grid. */
export const AdminLayoutSkeleton = () => {
    return (
        <>
            <TopBar />
            <PageLayout className={style['admin-layout']}>
                <div className={style['admin-layout__grid']}>
                    <Skeleton height={320} borderRadius={16} />
                    <div className={style['admin-layout__content']}>
                        <Skeleton width={160} height={24} />
                        <Skeleton height={120} />
                        <Skeleton height={120} />
                    </div>
                </div>
            </PageLayout>
        </>
    );
};
