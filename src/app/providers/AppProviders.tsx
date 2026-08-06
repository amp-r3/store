'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { persistor, store } from '@/app/store';
import { useAuthSync } from './auth/useAuthSync';
import { useNotificationsSync } from './notifications/useNotificationsSync';

// Split out so these hooks run inside <Provider>, where useAppDispatch/
// useAppSelector actually have a store to read from.
function AppEffects({ children }: { children: ReactNode }) {
  useAuthSync();
  useNotificationsSync();
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
          <AppEffects>{children}</AppEffects>
        </SkeletonTheme>
      </PersistGate>
    </Provider>
  );
}
