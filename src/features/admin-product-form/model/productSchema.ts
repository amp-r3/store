import { z } from 'zod';
import { isAllowedImageUrl } from '@/shared/config';

const emptyToNull = (val: unknown) => (val === '' || val === null || val === undefined ? null : val);

// Both fields feed next/image (11 render sites) — a host outside
// next.config.ts's images.remotePatterns fails at render with no
// form-level feedback, so validate the same allowlist here at submit time.
const IMAGE_URL_MESSAGE = 'Must be a valid https URL from Supabase Storage or Google avatars';

const optionalImageUrlField = z
    .string()
    .max(500, 'Too long')
    .refine((value) => value === '' || isAllowedImageUrl(value), { message: IMAGE_URL_MESSAGE });

const requiredImageUrlField = z
    .string()
    .trim()
    .min(1, 'URL is required')
    .max(500, 'Too long')
    .refine(isAllowedImageUrl, { message: IMAGE_URL_MESSAGE });

const basicsShape = {
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z.string().max(2000, 'Description is too long').optional(),
    categoryId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable()),
    brand: z.string().max(100, 'Too long').optional(),
    sku: z.string().max(100, 'Too long').optional(),
};

const pricingShape = {
    basePrice: z.coerce.number().min(0, 'Price must be 0 or more'),
    discountPercentage: z.coerce.number().min(0, 'Must be between 0 and 100').max(100, 'Must be between 0 and 100'),
};

const mediaShape = {
    thumbnail: optionalImageUrlField.optional(),
    images: z.array(z.object({ value: requiredImageUrlField })),
};

const logisticsShape = {
    weight: z.preprocess(emptyToNull, z.coerce.number().min(0, 'Must be 0 or more').nullable()),
    dimensions: z.object({
        width: z.coerce.number().min(0, 'Must be 0 or more'),
        height: z.coerce.number().min(0, 'Must be 0 or more'),
        depth: z.coerce.number().min(0, 'Must be 0 or more'),
    }),
    shippingInformation: z.string().max(500, 'Too long').optional(),
    minimumOrderQuantity: z.coerce.number().int().min(1, 'At least 1'),
};

const additionalShape = {
    warrantyInformation: z.string().max(500, 'Too long').optional(),
    returnPolicy: z.string().max(500, 'Too long').optional(),
    availabilityStatus: z.string().min(1, 'Select a status'),
    tags: z.array(z.object({ value: z.string().trim().min(1, 'Tag cannot be empty') })),
    barcode: z.string().max(100, 'Too long').optional(),
    qrCode: z.string().max(100, 'Too long').optional(),
};

export const SECTION_FIELDS = {
    basics: ['title', 'description', 'categoryId', 'brand', 'sku'],
    pricing: ['basePrice', 'discountPercentage'],
    media: ['thumbnail', 'images'],
    logistics: ['weight', 'dimensions', 'shippingInformation', 'minimumOrderQuantity'],
    additional: ['warrantyInformation', 'returnPolicy', 'availabilityStatus', 'tags', 'barcode', 'qrCode'],
} as const;

export const productSchema = z.object({
    ...basicsShape,
    ...pricingShape,
    ...mediaShape,
    ...logisticsShape,
    ...additionalShape,
});

export type ProductFormValues = z.infer<typeof productSchema>;
