import { describe, it, expect } from 'vitest';
import { getPostcodeMask, DEFAULT_POSTCODE_MASK, PHONE_MASK } from './masks';

describe('getPostcodeMask', () => {
  it('resolves US variants (united states / usa / us)', () => {
    expect(getPostcodeMask('united states').mask).toBe('00000[-0000]');
    expect(getPostcodeMask('usa').mask).toBe('00000[-0000]');
    expect(getPostcodeMask('us').mask).toBe('00000[-0000]');
  });

  it('resolves germany / de', () => {
    expect(getPostcodeMask('germany').mask).toBe('00000');
    expect(getPostcodeMask('de').mask).toBe('00000');
  });

  it('resolves poland / pl', () => {
    expect(getPostcodeMask('poland').mask).toBe('00-000');
    expect(getPostcodeMask('pl').mask).toBe('00-000');
  });

  it('resolves united kingdom / uk', () => {
    expect(getPostcodeMask('united kingdom').mask).toBe('a[a]0[0a] 0aa');
    expect(getPostcodeMask('uk').mask).toBe('a[a]0[0a] 0aa');
  });

  it('is case- and surrounding-whitespace-insensitive', () => {
    expect(getPostcodeMask('  Germany  ').mask).toBe('00000');
    expect(getPostcodeMask('POLAND').mask).toBe('00-000');
  });

  it('falls back to the default mask for an unknown country or undefined', () => {
    expect(getPostcodeMask('Narnia')).toBe(DEFAULT_POSTCODE_MASK);
    expect(getPostcodeMask(undefined)).toBe(DEFAULT_POSTCODE_MASK);
    expect(getPostcodeMask('')).toBe(DEFAULT_POSTCODE_MASK);
  });

  it('collapses doubled/repeated internal whitespace before lookup', () => {
    expect(getPostcodeMask('United  States').mask).toBe('00000[-0000]');
    expect(getPostcodeMask('united   kingdom').mask).toBe('a[a]0[0a] 0aa');
  });

  it('strips diacritics before lookup', () => {
    // Synthetic accented variant of an existing key — the table itself has
    // no accented entries, so this specifically exercises NFKD stripping.
    expect(getPostcodeMask('usá').mask).toBe('00000[-0000]');
  });

  // Not fixed by normalization — these are different words/tokens entirely,
  // not case/whitespace/diacritic variants of an existing key.
  it('still does not recognize a native-language name or a dotted abbreviation', () => {
    expect(getPostcodeMask('Deutschland')).toBe(DEFAULT_POSTCODE_MASK);
    expect(getPostcodeMask('U.S.')).toBe(DEFAULT_POSTCODE_MASK);
  });
});

describe('PHONE_MASK', () => {
  // The mask itself allows 0-15 digits; the 7-digit minimum is enforced only
  // by checkoutMasterSchema's regex (see checkoutMasterSchema.test.ts), so
  // pin both halves of this contract so they can't silently drift apart.
  it('the input mask permits 0 digits — the minimum comes from the Zod schema, not this mask', () => {
    const regex = PHONE_MASK.mask as RegExp;
    expect(regex.test('')).toBe(true);
    expect(regex.test('123')).toBe(true);
    expect(regex.test('+123456789012345')).toBe(true);
    expect(regex.test('1234567890123456')).toBe(false); // 16 digits exceeds the mask
  });
});
