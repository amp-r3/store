'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { selectIsAuth, selectUserRole } from '@/entities/session';
import { useAppSelector, useIsRehydrated } from '@/shared/model';
import { Loader } from '@/shared/ui';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const role = useAppSelector(selectUserRole);
  const isRehydrated = useIsRehydrated();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Without PersistGate, auth.user starts null until redux-persist
    // restores it — app/admin/layout.tsx already gated this server-side, but
    // redirecting client-side before rehydration would still wrongly bounce
    // an actually-authenticated admin for one frame.
    if (!isRehydrated) return;

    if (!isAuth) {
      const search = searchParams.toString();
      const from = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }

    // Redirect to '/' rather than '/login': PublicRoute would see isAuth and
    // immediately send a non-admin back here via the stored `from`, looping.
    if (role !== null && role !== 'admin') {
      router.replace('/');
    }
  }, [isRehydrated, isAuth, role, pathname, searchParams, router]);

  if (!isRehydrated) return null;
  if (!isAuth) return null;

  // `role` is null until useSessionSync's profiles fetch lands -- setSession
  // fires first with blank fields on every INITIAL_SESSION/TOKEN_REFRESHED.
  // Redirecting on that first render would bounce an admin off /admin on
  // every hard refresh; hold the route instead. useSessionSync always
  // resolves this to a non-null role even when the profile fetch fails, so
  // it cannot hang here.
  if (role === null) return <Loader />;

  if (role !== 'admin') return null;

  return <>{children}</>;
};
