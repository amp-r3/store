/** Origin used to build absolute redirect URLs (OAuth callbacks, etc).
 * Falls back to `window.location.origin` in the browser; a server-side
 * caller (no `window`) must set `NEXT_PUBLIC_SITE_URL` instead. */
export function getSiteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? '';
}
