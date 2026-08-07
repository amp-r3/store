import { AdminCategory } from '@/entities/admin';
import { AVAILABILITY_STATUS_OPTIONS } from '../config/availabilityStatusOptions';
import { UseProductMediaDraftResult } from '../lib/useProductMediaDraft';
import { ProductFormValues } from './productSchema';

export interface ProductChanges {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
}

type ChangeValue = string | number | null;

interface ChangeRow {
    label: string;
    read: (values: ProductFormValues, categories: AdminCategory[]) => ChangeValue;
}

const blankToNull = (value: string): ChangeValue => (value.trim() === '' ? null : value);

const CHANGE_ROWS: ChangeRow[] = [
    { label: 'Title', read: (v) => blankToNull(v.title) },
    { label: 'Category', read: (v, categories) => categories.find((c) => c.id === v.categoryId)?.name ?? null },
    { label: 'Brand', read: (v) => blankToNull(v.brand ?? '') },
    { label: 'SKU', read: (v) => blankToNull(v.sku ?? '') },
    { label: 'Description', read: (v) => blankToNull(v.description ?? '') },
    { label: 'Base price', read: (v) => v.basePrice },
    { label: 'Discount', read: (v) => `${v.discountPercentage}%` },
    { label: 'Weight', read: (v) => v.weight },
    { label: 'Width', read: (v) => v.dimensions.width },
    { label: 'Height', read: (v) => v.dimensions.height },
    { label: 'Depth', read: (v) => v.dimensions.depth },
    { label: 'Shipping information', read: (v) => blankToNull(v.shippingInformation ?? '') },
    { label: 'Min. order quantity', read: (v) => v.minimumOrderQuantity },
    { label: 'Warranty information', read: (v) => blankToNull(v.warrantyInformation ?? '') },
    { label: 'Return policy', read: (v) => blankToNull(v.returnPolicy ?? '') },
    {
        label: 'Availability status',
        read: (v) => AVAILABILITY_STATUS_OPTIONS.find((o) => o.value === v.availabilityStatus)?.label ?? v.availabilityStatus,
    },
    { label: 'Tags', read: (v) => (v.tags.length > 0 ? v.tags.join(', ') : null) },
    { label: 'Barcode', read: (v) => blankToNull(v.barcode ?? '') },
    { label: 'QR code', read: (v) => blankToNull(v.qrCode ?? '') },
];

const CURRENT_IMAGE = 'Current image';

const buildMediaChanges = (media: UseProductMediaDraftResult): { before: Record<string, unknown>; after: Record<string, unknown> } => {
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};

    const addSlot = (label: string, slot: { file: File | null; removed: boolean; existingUrl: string | null }) => {
        if (slot.file) {
            before[label] = slot.existingUrl ? CURRENT_IMAGE : null;
            after[label] = slot.file.name;
        } else if (slot.removed) {
            before[label] = CURRENT_IMAGE;
            after[label] = null;
        }
    };

    addSlot('Thumbnail', media.thumbnail);
    media.gallery.forEach((slot) => addSlot(`Image ${slot.index}`, slot));

    return { before, after };
};

// Diffs against the normalized baseline (productDetailToFormValues), not RHF's
// dirtyFields — dirtyFields compares against defaultValues in the pre-Zod-coercion
// input shape, so a numeric field touched and reverted (e.g. "99" vs 99) reports a
// phantom change. Comparing two normalized ProductFormValues sidesteps that.
export const buildProductChanges = (
    baseline: ProductFormValues,
    values: ProductFormValues,
    categories: AdminCategory[],
    media: UseProductMediaDraftResult
): ProductChanges => {
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};

    for (const row of CHANGE_ROWS) {
        const beforeValue = row.read(baseline, categories);
        const afterValue = row.read(values, categories);
        if (beforeValue !== afterValue) {
            before[row.label] = beforeValue;
            after[row.label] = afterValue;
        }
    }

    const mediaChanges = buildMediaChanges(media);
    Object.assign(before, mediaChanges.before);
    Object.assign(after, mediaChanges.after);

    return { before, after };
};

export const hasProductChanges = (changes: ProductChanges): boolean => Object.keys(changes.after).length > 0;
