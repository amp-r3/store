// Mirrors the WHATWG URL parser's own input-scrubbing step: browsers trim
// leading/trailing whitespace, then strip every ASCII tab/CR/LF anywhere in
// the string before resolving it. A value like "/\t//evil.com" doesn't
// literally start with "//" as written, but a browser resolves it as one —
// normalize the same way before checking, or that variant slips past.
const normalizeForUrlCheck = (value: string): string => value.trim().replace(/[\t\n\r]/g, '');

/**
 * Post-login redirect targets can come from sessionStorage (round-tripped
 * through an OAuth provider), so an attacker-writable or stale value could
 * point somewhere outside the app (e.g. `//evil.com` or `https://evil.com`).
 * Only allow same-app paths: must start with a single `/`, never `//` or `/\`.
 */
export const safeRedirectPath = (path: string | null | undefined): string => {
  if (!path) return '/';

  const normalized = normalizeForUrlCheck(path);
  if (!normalized.startsWith('/')) return '/';
  if (normalized.startsWith('//') || normalized.startsWith('/\\')) return '/';

  return normalized;
};
