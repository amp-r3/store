import { SUPABASE_STORAGE_PUBLIC_URL } from './images';

export const PRODUCT_IMAGE_BUCKET = 'images';
export const PRODUCT_IMAGE_MIME = 'image/webp';
export const MAX_PRODUCT_IMAGES = 6;

export type ProductImageKind = 'thumbnail' | 'gallery';

interface ProductImageRule {
    /** Recommended max — exceeding it is a warning, not a blocker. */
    softMaxBytes: number;
    /** Hard cap so nobody ships a multi-MB file — exceeding it is an error. */
    hardMaxBytes: number;
    width: number;
    height: number;
}

export const PRODUCT_IMAGE_RULES: Record<ProductImageKind, ProductImageRule> = {
    thumbnail: { softMaxBytes: 10 * 1024, hardMaxBytes: 50 * 1024, width: 400, height: 400 },
    gallery: { softMaxBytes: 100 * 1024, hardMaxBytes: 500 * 1024, width: 1000, height: 1000 },
};

/** `product-15-thumb.webp` / `product-15-2.webp` — same scheme already used by every existing row in Storage. */
export const buildProductImageName = (productId: number, kind: ProductImageKind, index?: number): string =>
    kind === 'thumbnail' ? `product-${productId}-thumb.webp` : `product-${productId}-${index}.webp`;

export const buildProductImageUrl = (name: string): string => `${SUPABASE_STORAGE_PUBLIC_URL}/${PRODUCT_IMAGE_BUCKET}/${name}`;
