import { AdminProductDetail, AdminProductPayload, CreateAdminProductPayload } from '@/entities/admin';
import { AVAILABILITY_STATUS_OPTIONS } from '../config/availabilityStatusOptions';
import { ProductFormValues } from './productSchema';

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
    title: '',
    description: '',
    categoryId: null,
    brand: '',
    sku: '',
    basePrice: 0,
    discountPercentage: 0,
    thumbnail: '',
    images: [],
    weight: null,
    dimensions: { width: 0, height: 0, depth: 0 },
    shippingInformation: '',
    minimumOrderQuantity: 1,
    warrantyInformation: '',
    returnPolicy: '',
    availabilityStatus: AVAILABILITY_STATUS_OPTIONS[0].value,
    tags: [],
    barcode: '',
    qrCode: '',
};

export const productDetailToFormValues = (product: AdminProductDetail): ProductFormValues => ({
    title: product.title,
    description: product.description ?? '',
    categoryId: product.categoryId,
    brand: product.brand ?? '',
    sku: product.sku ?? '',
    basePrice: product.basePrice,
    discountPercentage: product.discountPercentage,
    thumbnail: product.thumbnail ?? '',
    images: product.images.map((value) => ({ value })),
    weight: product.weight,
    dimensions: product.dimensions,
    shippingInformation: product.shippingInformation ?? '',
    minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
    warrantyInformation: product.warrantyInformation ?? '',
    returnPolicy: product.returnPolicy ?? '',
    availabilityStatus: product.availabilityStatus ?? AVAILABILITY_STATUS_OPTIONS[0].value,
    tags: product.tags.map((value) => ({ value })),
    barcode: product.meta.barcode,
    qrCode: product.meta.qrCode,
});

// Text fields clear with an empty string, not `undefined` — admin_update_product
// only treats `categoryId`/`images`/`tags`/`weight` as presence-checked
// (`p_payload ? 'key'`), everything else falls back via `coalesce(payload->>'x', x)`
// when the key is missing, so omitting a cleared field would silently keep
// the old value instead of clearing it.
export const formValuesToPayload = (values: ProductFormValues): AdminProductPayload => ({
    title: values.title,
    description: values.description ?? '',
    categoryId: values.categoryId,
    basePrice: values.basePrice,
    discountPercentage: values.discountPercentage,
    thumbnail: values.thumbnail ?? '',
    images: values.images.map((item) => item.value),
    tags: values.tags.map((item) => item.value),
    brand: values.brand ?? '',
    sku: values.sku ?? '',
    weight: values.weight,
    dimensions: values.dimensions,
    warrantyInformation: values.warrantyInformation ?? '',
    shippingInformation: values.shippingInformation ?? '',
    availabilityStatus: values.availabilityStatus,
    returnPolicy: values.returnPolicy ?? '',
    minimumOrderQuantity: values.minimumOrderQuantity,
    meta: { barcode: values.barcode ?? '', qrCode: values.qrCode ?? '' },
});

export const formValuesToCreatePayload = (values: ProductFormValues): CreateAdminProductPayload =>
    formValuesToPayload(values) as CreateAdminProductPayload;
