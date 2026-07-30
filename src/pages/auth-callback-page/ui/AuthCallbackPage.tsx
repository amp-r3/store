import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { selectIsRecoverySession, selectToken } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { AuthCard, Loader } from '@/shared/ui';
import { safeRedirectPath } from '@/shared/lib';
import { AUTH_STORAGE_KEYS } from '@/shared/config';
import style from './auth-callback-page.module.scss';

const CALLBACK_TIMEOUT_MS = 12_000;

/** Lands both OAuth and password-reset email links here. Does not touch
 * Supabase directly (forbidden outside api/ segments, and unnecessary):
 * `detectSessionInUrl` already exchanged the `?code=` before this component
 * mounts, and useSessionSync mirrors the resulting session into `selectToken`.
 * This page only waits for that and then routes onward. */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAppSelector(selectToken);
  const isRecovery = useAppSelector(selectIsRecoverySession);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const next = searchParams.get('next');

  useEffect(() => {
    const id = window.setTimeout(() => setHasTimedOut(true), CALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!token) return;

    const storedFrom = sessionStorage.getItem(AUTH_STORAGE_KEYS.redirectFrom);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom);

    // `next` is set by us on the reset-password link; `isRecovery` is the
    // fallback if a GoTrue version ever drops it. Otherwise this is a normal
    // OAuth round-trip and we honour the stashed pre-login destination.
    const target = next
      ? safeRedirectPath(next)
      : isRecovery
        ? '/reset-password'
        : safeRedirectPath(storedFrom);

    navigate(target, { replace: true });
  }, [token, isRecovery, next, navigate]);

  useEffect(() => {
    if (!hasTimedOut || token) return;

    // Reuse the existing error plumbing (useAuthUrlError on /login) rather
    // than inventing a second error channel.
    const description = encodeURIComponent(
      "We couldn't finish signing you in. If you opened a link from an email, open it in the browser you requested it from."
    );
    navigate(`/login?error=callback_failed&error_description=${description}`, { replace: true });
  }, [hasTimedOut, token, navigate]);

  return (
    <AuthCard title="Finishing sign-in…" subtitle="Hang tight, this only takes a second.">
      <div className={style['auth-callback__body']}>
        <Loader />
      </div>
    </AuthCard>
  );
};
