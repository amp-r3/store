'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { SkeletonTheme } from 'react-loading-skeleton';
import { store } from '@/app/store';
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
  return (
    <Provider store={store}>
      <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
        <AppEffects>{children}</AppEffects>
      </SkeletonTheme>
    </Provider>
  );
}
