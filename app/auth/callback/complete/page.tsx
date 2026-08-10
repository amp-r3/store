'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard, Loader } from '@/shared/ui';
import { safeRedirectPath } from '@/shared/lib';
import { AUTH_STORAGE_KEYS } from '@/shared/config';
import style from './complete.module.scss';

/** app/auth/callback/route.ts only lands here after the session cookie is
 * already set, so there's nothing to wait for — just read back the
 * pre-OAuth destination useOAuthSignIn stashed and go. */
export default function AuthCallbackCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const storedFrom = sessionStorage.getItem(AUTH_STORAGE_KEYS.redirectFrom);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom);
    router.replace(safeRedirectPath(storedFrom));
  }, [router]);

  return (
    <AuthCard
      title="Finishing sign-in…"
      subtitle="Hang tight, this only takes a second."
      backTo={null}
      isLoading
    >
      <div className={style['auth-callback-complete__body']}>
        <Loader size="md" />
      </div>
    </AuthCard>
  );
}
