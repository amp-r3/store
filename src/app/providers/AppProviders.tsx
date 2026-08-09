'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { SkeletonTheme } from 'react-loading-skeleton';
import { makeStore, type AppStore } from '@/app/store';
import { RouteProgress, Toaster } from '@/shared/ui';
import { useAuthSync } from './auth/useAuthSync';
import { useNotificationsSync } from './notifications/useNotificationsSync';

// Split out so these hooks run inside <Provider>, where useAppDispatch/
// useAppSelector actually have a store to read from.
function AppEffects({ children }: { children: ReactNode }) {
  useAuthSync();
  useNotificationsSync();
  return <>{children}</>;
}

// No <PersistGate> here on purpose: it blocks all rendering until
// redux-persist's rehydration resolves, which never happens on the server —
// that's exactly what kept every page from producing any SSR HTML. The tree
// now renders immediately with each persisted slice's initial state, and
// individual components that show persisted data (cart/wishlist badges) use
// useIsRehydrated() to avoid a flash of stale/empty state instead.
export function AppProviders({ children }: { children: ReactNode }) {
  // One store per component instance rather than a module-level singleton:
  // this component also renders in the Node server process, where a shared
  // store would leak across concurrent requests. persistStore() is started
  // only in the browser — on the server it would just spin against
  // persistStorage's no-op stand-in for no reason.
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (typeof window !== 'undefined') {
      persistStore(storeRef.current);
    }
  }

  return (
    <Provider store={storeRef.current}>
      <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
        <RouteProgress />
        <Toaster />
        <AppEffects>{children}</AppEffects>
      </SkeletonTheme>
    </Provider>
  );
}
