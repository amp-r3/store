'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { selectIsAuth } from '@/entities/session';
import { useAppSelector, useIsRehydrated } from "@/shared/model";
import { safeRedirectPath } from "@/shared/lib";
import { AUTH_STORAGE_KEYS } from "@/shared/config";

/** Sole owner of the post-login redirect: reacts to `isAuth` becoming true
 * (from either a password login or an OAuth round-trip) and redirects to
 * wherever the user was headed before being sent to /login or /register.
 * `from` comes from sessionStorage (round-tripped through an OAuth provider)
 * or, failing that, the `?from=` query param the guards attach when they
 * redirect here. Read inside an effect, not render, so the sessionStorage
 * read+clear can't run twice against a StrictMode double-render. */
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const isRehydrated = useIsRehydrated();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isRehydrated || !isAuth) return;

    const storedFrom = sessionStorage.getItem(AUTH_STORAGE_KEYS.redirectFrom);
    const from = safeRedirectPath(storedFrom || searchParams.get('from'));

    if (storedFrom) {
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom);
    }

    router.replace(from);
  }, [isRehydrated, isAuth, router, searchParams]);

  // Without PersistGate, auth.user starts null until redux-persist restores
  // it — rendering the form immediately would flash /login at an
  // already-authenticated returning visitor for one frame.
  if (!isRehydrated) return null;
  if (isAuth) return null;

  return <>{children}</>;
};
