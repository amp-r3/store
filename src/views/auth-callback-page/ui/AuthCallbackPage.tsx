import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectToken } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { AuthCard, Loader } from '@/shared/ui';
import { safeRedirectPath } from '@/shared/lib';
import { AUTH_STORAGE_KEYS } from '@/shared/config';
import style from './auth-callback-page.module.scss';

const CALLBACK_TIMEOUT_MS = 12_000;

/** Lands OAuth redirects here. Does not touch Supabase directly (forbidden
 * outside api/ segments, and unnecessary): `detectSessionInUrl` already
 * exchanged the `?code=` before this component mounts, and useSessionSync
 * mirrors the resulting session into `selectToken`. This page only waits for
 * that and then routes onward to the stashed pre-login destination. */
export const AuthCallbackPage = () => {
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setHasTimedOut(true), CALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!token) return;

    const storedFrom = sessionStorage.getItem(AUTH_STORAGE_KEYS.redirectFrom);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom);

    router.replace(safeRedirectPath(storedFrom));
  }, [token, router]);

  useEffect(() => {
    if (!hasTimedOut || token) return;

    // Reuse the existing error plumbing (useAuthUrlError on /login) rather
    // than inventing a second error channel.
    const description = encodeURIComponent(
      "We couldn't finish signing you in. If you opened a link from an email, open it in the browser you requested it from."
    );
    router.replace(`/login?error=callback_failed&error_description=${description}`);
  }, [hasTimedOut, token, router]);

  return (
    <AuthCard title="Finishing sign-in…" subtitle="Hang tight, this only takes a second." backTo={null}>
      <div className={style['auth-callback__body']}>
        <Loader />
      </div>
    </AuthCard>
  );
};
