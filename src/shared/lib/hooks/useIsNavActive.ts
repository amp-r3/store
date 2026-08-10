'use client';

import { usePathname } from 'next/navigation';

/** Mirrors react-router's `NavLink` `end` semantics: without `end`, `to`
 * matches its own path and any nested path under it (`/admin` also matches
 * `/admin/orders`); with `end`, only an exact match counts. */
export function useIsNavActive(to: string, end = false): boolean {
  const pathname = usePathname();

  if (end) return pathname === to;

  return pathname === to || pathname.startsWith(`${to}/`);
}
