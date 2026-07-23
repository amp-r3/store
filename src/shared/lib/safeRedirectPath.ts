/**
 * Post-login redirect targets can come from sessionStorage (round-tripped
 * through an OAuth provider), so an attacker-writable or stale value could
 * point somewhere outside the app (e.g. `//evil.com` or `https://evil.com`).
 * Only allow same-app paths: must start with a single `/`, never `//` or `/\`.
 */
export const safeRedirectPath = (path: string | null | undefined): string => {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//') || path.startsWith('/\\')) return '/';

  return path;
};
