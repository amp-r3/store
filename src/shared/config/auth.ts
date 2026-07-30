/** Supabase provider ids as used by `supabase.auth.signInWithOAuth`/`app_metadata.providers`. */
export type AuthProviderId = 'google' | 'email' | 'custom:telegram';

export type OAuthProviderId = Exclude<AuthProviderId, 'email'>;

/** sessionStorage keys used to round-trip state across the OAuth redirect. */
export const AUTH_STORAGE_KEYS = {
  oauthProvider: 'oauth_provider',
  redirectFrom: 'auth_redirect_from',
  blockedProviders: 'blocked_providers',
} as const;
