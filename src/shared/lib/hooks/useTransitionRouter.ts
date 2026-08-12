'use client';

import { useCallback, useEffect, useMemo, useTransition } from 'react';
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

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      startTransition(() => router.push(href, options));
    },
    [router],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      startTransition(() => router.replace(href, options));
    },
    [router],
  );

  // Memoized so consumers that put this return value (or a destructured
  // function from it) in a dependency array — e.g. useUrlState's
  // setSearchParams, which useAuthUrlError's effect depends on — don't
  // re-run every render. Without this, push/replace/the returned object
  // were new references each render, chaining into an infinite render loop
  // wherever they fed a useCallback/useEffect dependency array.
  return useMemo(() => ({ push, replace, isPending }), [push, replace, isPending]);
}
