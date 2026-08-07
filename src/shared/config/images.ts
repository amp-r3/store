const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required to resolve the allowed image hosts.');
}

/** Derived instead of hardcoded: next.config.ts's images.remotePatterns used
 * to hardcode the Supabase project ref directly, which silently broke every
 * product image on a project swap (staging, fork, key rotation) since it
 * never tracked NEXT_PUBLIC_SUPABASE_URL. */
export const SUPABASE_IMAGE_HOST = new URL(supabaseUrl).hostname;

// profiles.avatar_url is seeded from raw_user_meta_data on signup (see
// supabase/schema.sql's handle_new_user trigger) — for a Google OAuth
// signup that's a googleusercontent.com URL, not Storage.
const GOOGLE_AVATAR_HOST_SUFFIX = '.googleusercontent.com';

/** Mirrors next.config.ts's images.remotePatterns — kept as the single
 * source of truth so admin form validation and the Next image config can't
 * drift apart. */
export function isAllowedImageUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;

  return url.hostname === SUPABASE_IMAGE_HOST || url.hostname.endsWith(GOOGLE_AVATAR_HOST_SUFFIX);
}
