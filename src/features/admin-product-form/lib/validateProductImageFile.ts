import { PRODUCT_IMAGE_MIME, PRODUCT_IMAGE_RULES, ProductImageKind } from '@/shared/config';

export interface ProductImageValidation {
    error?: string;
    warning?: string;
}

const formatKb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

const readDimensions = async (file: File): Promise<{ width: number; height: number }> => {
    if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(file);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return dimensions;
    }

    // Safari fallback — createImageBitmap support for webp landed later there.
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not read image dimensions'));
        };
        image.src = url;
    });
};

export const validateProductImageFile = async (file: File, kind: ProductImageKind): Promise<ProductImageValidation> => {
    const rule = PRODUCT_IMAGE_RULES[kind];

    if (file.type !== PRODUCT_IMAGE_MIME) {
        return { error: 'Only .webp files are allowed' };
    }

    if (file.size > rule.hardMaxBytes) {
        return { error: `File is too large (max ${formatKb(rule.hardMaxBytes)})` };
    }

    let dimensionWarning: string | undefined;
    try {
        const { width, height } = await readDimensions(file);
        if (width !== rule.width || height !== rule.height) {
            dimensionWarning = `Recommended ${rule.width}×${rule.height} — this image is ${width}×${height}`;
        }
    } catch {
        // Unreadable dimensions aren't a blocker — size/format checks already passed.
    }

    if (file.size > rule.softMaxBytes) {
        return { warning: `Recommended under ${formatKb(rule.softMaxBytes)} — this file is ${formatKb(file.size)}` };
    }

    if (dimensionWarning) {
        return { warning: dimensionWarning };
    }

    return {};
};
