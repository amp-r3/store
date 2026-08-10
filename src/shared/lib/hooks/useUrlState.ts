'use client';

import { useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTransitionRouter } from './useTransitionRouter';

type SearchParamsUpdater = URLSearchParams | ((prev: URLSearchParams) => URLSearchParams);

interface SetSearchParamsOptions {
  replace?: boolean;
}

/** Same shape as react-router's `useSearchParams()` tuple — a callback/value
 * updater plus a `{ replace }` option — built on `next/navigation`'s
 * read-only version, so call sites written against react-router barely
 * change. Query-only updates never scroll (react-router's version never did,
 * since ScrollRestoration was keyed by pathname alone). */
export function useUrlState(): [
  URLSearchParams,
  (updater: SearchParamsUpdater, options?: SetSearchParamsOptions) => void,
] {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const setSearchParams = useCallback(
    (updater: SearchParamsUpdater, options?: SetSearchParamsOptions) => {
      const next =
        typeof updater === 'function' ? updater(new URLSearchParams(searchParams)) : updater;

      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      if (options?.replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  return [searchParams, setSearchParams];
}
