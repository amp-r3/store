import { useCallback, useSyncExternalStore } from 'react';

function subscribe(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

// SSR has no viewport to match against — assume desktop-first (`false`) so the
// server-rendered markup doesn't depend on a client-only API. Whatever branch
// this drives will reconcile on the client's first paint.
function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    useCallback((callback) => subscribe(query, callback), [query]),
    useCallback(() => getSnapshot(query), [query]),
    getServerSnapshot,
  );
}
