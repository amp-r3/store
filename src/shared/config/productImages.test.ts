import { describe, it, expect } from 'vitest';
import { buildProductImageName, buildProductImageUrl } from './productImages';
import { SUPABASE_STORAGE_PUBLIC_URL } from './images';

describe('buildProductImageName', () => {
  it('builds the thumbnail name, ignoring any index argument', () => {
    expect(buildProductImageName(15, 'thumbnail')).toBe('product-15-thumb.webp');
    expect(buildProductImageName(15, 'thumbnail', 2)).toBe('product-15-thumb.webp');
  });

  it('builds a gallery name from the given index', () => {
    expect(buildProductImageName(15, 'gallery', 2)).toBe('product-15-2.webp');
  });

  // `index` is typed optional but only meaningful for 'gallery' — the type
  // system permits calling it without one, and this is what actually
  // happens: the literal string "undefined" gets baked into the filename.
  it('bakes the literal "undefined" into a gallery name called with no index', () => {
    expect(buildProductImageName(15, 'gallery')).toBe('product-15-undefined.webp');
  });
});

describe('buildProductImageUrl', () => {
  it('joins the storage public URL, bucket, and name', () => {
    expect(buildProductImageUrl('product-15-thumb.webp')).toBe(
      `${SUPABASE_STORAGE_PUBLIC_URL}/images/product-15-thumb.webp`,
    );
  });
});
