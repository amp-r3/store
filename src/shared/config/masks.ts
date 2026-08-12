import type { FactoryOpts } from 'imask';

// General international format (E.164-ish): optional leading +, 7-15 digits.
// Not tied to a specific country, since the checkout address is free-text.
export const PHONE_MASK: FactoryOpts = {
  mask: /^\+?\d{0,15}$/,
};

// Keyed by lowercased country name — the checkout address form takes free-text
// country input, not an ISO-coded select.
const POSTCODE_MASKS: Record<string, FactoryOpts> = {
  'united states': { mask: '00000[-0000]' },
  usa: { mask: '00000[-0000]' },
  us: { mask: '00000[-0000]' },
  germany: { mask: '00000' },
  de: { mask: '00000' },
  poland: { mask: '00-000' },
  pl: { mask: '00-000' },
  'united kingdom': { mask: 'a[a]0[0a] 0aa', prepare: (chars: string) => chars.toUpperCase() },
  uk: { mask: 'a[a]0[0a] 0aa', prepare: (chars: string) => chars.toUpperCase() },
};

export const DEFAULT_POSTCODE_MASK: FactoryOpts = { mask: /^[A-Za-z0-9 -]{0,10}$/ };

const DIACRITIC_MARKS = /[̀-ͯ]/g;
const REPEATED_WHITESPACE = /\s+/g;

// Case/whitespace/diacritic-insensitive lookup key — the checkout country
// field is free text, so "Germany", "  Germany  ", "GERMANY", and an
// accented variant should all resolve to the same table entry.
const normalizeCountryName = (country: string): string =>
  country
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(DIACRITIC_MARKS, '')
    .replace(REPEATED_WHITESPACE, ' ');

export const getPostcodeMask = (country?: string): FactoryOpts => {
  if (!country) return DEFAULT_POSTCODE_MASK;
  return POSTCODE_MASKS[normalizeCountryName(country)] ?? DEFAULT_POSTCODE_MASK;
};
