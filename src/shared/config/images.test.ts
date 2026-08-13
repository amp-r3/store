import { describe, it, expect } from 'vitest';
import { isAllowedImageUrl, SUPABASE_IMAGE_HOST } from './images';

// SUPABASE_IMAGE_HOST resolves from NEXT_PUBLIC_SUPABASE_URL, which
// vitest.config.ts stubs to 'https://stub.supabase.co' — so the host under
// test is 'stub.supabase.co', not a hardcoded project ref.
describe('isAllowedImageUrl', () => {
  it('allows an https URL on the Supabase storage host', () => {
    expect(
      isAllowedImageUrl(`https://${SUPABASE_IMAGE_HOST}/storage/v1/object/public/x.webp`),
    ).toBe(true);
  });

  it('allows an https googleusercontent.com avatar URL', () => {
    expect(isAllowedImageUrl('https://lh3.googleusercontent.com/a/avatar')).toBe(true);
  });

  it('rejects a bare http URL on an otherwise-allowed host', () => {
    expect(isAllowedImageUrl(`http://${SUPABASE_IMAGE_HOST}/x.webp`)).toBe(false);
  });

  it('rejects an arbitrary external host', () => {
    expect(isAllowedImageUrl('https://evil.com/x.webp')).toBe(false);
  });

  // The leading dot in the suffix check is the only thing preventing this
  // exact bypass — a hostname that merely contains "googleusercontent.com"
  // without a preceding dot must not match (same bug class as
  // safeRedirectPath's protocol-relative-URL guard).
  it('rejects a hostname that merely contains the Google suffix without a preceding dot', () => {
    expect(isAllowedImageUrl('https://evilgoogleusercontent.com/x')).toBe(false);
  });

  it('rejects an unparseable value rather than throwing', () => {
    expect(isAllowedImageUrl('not a url')).toBe(false);
    expect(isAllowedImageUrl('/relative/path.webp')).toBe(false);
  });

  it('allows a case-variant hostname (URL lowercases it) and ignores embedded credentials', () => {
    expect(isAllowedImageUrl(`https://${SUPABASE_IMAGE_HOST.toUpperCase()}/x.webp`)).toBe(true);
    expect(isAllowedImageUrl(`https://user:pass@${SUPABASE_IMAGE_HOST}/x.webp`)).toBe(true);
  });
});
