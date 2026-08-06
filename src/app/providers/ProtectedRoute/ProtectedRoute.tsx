'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { selectIsAuth } from '@/entities/session';
import { useAppSelector, useIsRehydrated } from "@/shared/model";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const isRehydrated = useIsRehydrated();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Without PersistGate, auth.user starts null on every load until
    // redux-persist restores it — redirecting before that resolves would
    // bounce an already-authenticated returning visitor to /login.
    if (!isRehydrated) return;
    if (!isAuth) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isRehydrated, isAuth, pathname, router]);

  if (!isRehydrated) return null;
  if (!isAuth) return null;

  return <>{children}</>;
};
