import { useLocation } from 'react-router';
import { useSignInWithOAuthMutation } from '@/entities/session';
import { getErrorMessage, safeRedirectPath } from '@/shared/lib';
import { AUTH_STORAGE_KEYS, type OAuthProviderId } from '@/shared/config';
import type { LocationState } from '@/shared/types';

/** One sign-in function for every OAuth provider, replacing the four
 * near-identical Google/Telegram handlers login and register used to carry.
 * Stashes the provider id and post-login redirect target in sessionStorage
 * before handing off to Supabase's OAuth redirect, and rolls both back if
 * the redirect never completes (e.g. the provider call itself fails). */
export const useOAuthSignIn = (onError: (message: string) => void) => {
  const location = useLocation();
  const [signInWithOAuth] = useSignInWithOAuthMutation();

  return async (provider: OAuthProviderId) => {
    const from = safeRedirectPath((location.state as LocationState | null)?.from);

    try {
      sessionStorage.setItem(AUTH_STORAGE_KEYS.oauthProvider, provider);
      sessionStorage.setItem(AUTH_STORAGE_KEYS.redirectFrom, from);
      await signInWithOAuth(provider).unwrap();
    } catch (err) {
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthProvider);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom);
      onError(getErrorMessage(err));
    }
  };
};
