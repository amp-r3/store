'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import {
  getRouteProgressServerSnapshot,
  getRouteProgressSnapshot,
  resetRouteProgress,
  startRouteProgress,
  subscribeRouteProgress,
} from '@/shared/lib';
import style from './route-progress.module.scss';

const SAFETY_TIMEOUT_MS = 10_000;
const DONE_LINGER_MS = 250;

const isModifiedClick = (event: MouseEvent) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/** Fixed top progress bar, the App Router analogue of the top bar this app
 * had before the Next.js migration: the previous route stays mounted and
 * interactive while the next one loads, instead of a full-screen loading.tsx
 * fallback replacing it. Starts on same-origin <a> clicks that change the
 * pathname, and on any push/replace reported via useTransitionRouter (URL
 * filters, programmatic redirects to /checkout, etc). */
export const RouteProgress = () => {
  const pathname = usePathname();
  const active = useSyncExternalStore(
    subscribeRouteProgress,
    getRouteProgressSnapshot,
    getRouteProgressServerSnapshot,
  );
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  const doneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event) || event.defaultPrevented) return;

      const anchor = (event.target as HTMLElement | null)?.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      startRouteProgress();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // The pathname changing is the one signal common to every navigation
  // path (link click or useTransitionRouter push/replace), so resetting
  // here can't leave the ref-count out of sync with either source.
  useEffect(() => {
    resetRouteProgress();
  }, [pathname]);

  useEffect(() => {
    if (active) {
      if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current);
      setPhase('loading');

      safetyTimeoutRef.current = setTimeout(resetRouteProgress, SAFETY_TIMEOUT_MS);
      return () => {
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      };
    }

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setPhase((prev) => {
      if (prev !== 'loading') return prev;
      return 'done';
    });
  }, [active]);

  useEffect(() => {
    if (phase !== 'done') return undefined;

    doneTimeoutRef.current = setTimeout(() => setPhase('idle'), DONE_LINGER_MS);
    return () => {
      if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current);
    };
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      className={`${style['route-progress']} ${style[`route-progress--${phase}`]}`}
    />
  );
};
