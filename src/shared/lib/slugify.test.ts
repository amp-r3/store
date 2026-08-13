import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases, trims, and collapses non-alphanumeric runs into a single dash', () => {
    expect(slugify('  Café Latte  ')).toBe('cafe-latte');
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('strips leading/trailing dashes left by punctuation-only edges', () => {
    expect(slugify('---')).toBe('');
  });

  // The admin category form writes this result with shouldValidate: false
  // (AdminCategoryFormModal.tsx), so an empty slug here can reach submit.
  it('produces an empty slug for non-Latin input — NFKD has nothing to decompose', () => {
    expect(slugify('Куртка')).toBe('');
  });

  it('silently drops characters NFKD cannot decompose, rather than transliterating them', () => {
    expect(slugify('ß straße')).toBe('stra-e');
    expect(slugify('Æther')).toBe('ther');
  });
});
