import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSignInWithOAuthMutation } from '@/entities/session';
import { getErrorMessage, safeRedirectPath } from '@/shared/lib';
import { AUTH_STORAGE_KEYS, type OAuthProviderId } from '@/shared/config';

/** One sign-in function for every OAuth provider, replacing the four
 * near-identical Google/Telegram handlers login and register used to carry.
 * Stashes the provider id and post-login redirect target in sessionStorage
 * before handing off to Supabase's OAuth redirect, and rolls both back if
 * the redirect never completes (e.g. the provider call itself fails).
 *
 * Tracks which provider is mid-flight so callers can disable/spin the right
 * button. `pendingProvider` is cleared only on error, never in a `finally` —
 * `signInWithOAuth` resolves as the full-page redirect kicks off, so
 * clearing it on success would briefly re-enable every button right before
 * the browser navigates away. */
export const useOAuthSignIn = (onError: (message: string) => void) => {
  const searchParams = useSearchParams();
  const [signInWithOAuth] = useSignInWithOAuthMutation();
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);

  const signIn = useCallback(async (provider: OAuthProviderId) => {
    if (pendingProvider) return;

    const from = safeRedirectPath(searchParams.get('from'));

    setPendingProvider(provider);
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEYS.oauthProvider, provider);
      sessionStorage.setItem(AUTH_STORAGE_KEYS.redirectFrom, from);
      await signInWithOAuth(provider).unwrap();
    } catch (err) {
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthProvider);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom);
      setPendingProvider(null);
      onError(getErrorMessage(err));
    }
  }, [pendingProvider, searchParams, signInWithOAuth, onError]);

  return { signInWithOAuth: signIn, pendingProvider };
};
