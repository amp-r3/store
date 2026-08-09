'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { endRouteProgress, startRouteProgress } from '@/shared/lib/routeProgress';

type NavigateOptions = Parameters<ReturnType<typeof useRouter>['push']>[1];

/** Wraps next/navigation's router so every programmatic push/replace reports
 * into the RouteProgress bar the same way link clicks do — startTransition
 * keeps the previous screen mounted while the navigation resolves, mirroring
 * what <Link> does natively. Use this instead of useRouter() anywhere that
 * calls push/replace outside of a plain <Link>. */
export function useTransitionRouter() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (isPending) {
            startRouteProgress();
            return endRouteProgress;
        }
        return undefined;
    }, [isPending]);

    const push = (href: string, options?: NavigateOptions) => {
        startTransition(() => router.push(href, options));
    };

    const replace = (href: string, options?: NavigateOptions) => {
        startTransition(() => router.replace(href, options));
    };

    return { push, replace, isPending };
}
