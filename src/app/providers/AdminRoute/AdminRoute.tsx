'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { selectIsAuth, selectUserRole } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { Loader } from '@/shared/ui';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const role = useAppSelector(selectUserRole);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
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
  }, [isAuth, role, pathname, searchParams, router]);

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
