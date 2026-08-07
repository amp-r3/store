import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useController, Control, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuTriangleAlert } from 'react-icons/lu';

import { FormField, Textarea, Select, Button, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import {
    AdminProductDetail,
    useGetAdminCategoriesQuery,
    useCreateAdminProductMutation,
    useUpdateAdminProductMutation,
} from '@/entities/admin';

import { productSchema, ProductFormValues } from '../model/productSchema';
import { DEFAULT_PRODUCT_FORM_VALUES, productDetailToFormValues, formValuesToPayload, formValuesToCreatePayload } from '../model/productFormMapping';
import { calculatePrice } from '../model/calculatePrice';
import { AVAILABILITY_STATUS_OPTIONS } from '../config/availabilityStatusOptions';
import { AdminProductFormSection, AdminProductArrayField, AdminProductSizesEditor } from './components';

import style from './admin-product-form.module.scss';

interface AdminProductFormProps {
    product?: AdminProductDetail;
}

export const AdminProductForm = ({ product }: AdminProductFormProps) => {
    const router = useRouter();
    const isEditMode = !!product;

    const { data: categories } = useGetAdminCategoriesQuery();
    const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();
    const isSaving = isCreating || isUpdating;

    const {
        register,
        control,
        watch,
        reset,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<z.input<typeof productSchema>, unknown, ProductFormValues>({
        resolver: zodResolver(productSchema),
        mode: 'onTouched',
        defaultValues: DEFAULT_PRODUCT_FORM_VALUES,
    });

    useEffect(() => {
        if (product) {
            reset(productDetailToFormValues(product));
        }
    }, [product, reset]);

    const basePrice = Number(watch('basePrice')) || 0;
    const discountPercentage = Number(watch('discountPercentage')) || 0;
    const previewPrice = calculatePrice(basePrice, discountPercentage);
    const isPriceDrop = isEditMode && previewPrice < product.price;

    // AdminProductArrayField is shared between images[] and tags[], so its
    // control/register props are widened to `any` — see the component for why.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const arrayFieldControl = control as unknown as Control<any>;
    const arrayFieldRegister = register as unknown as UseFormRegister<any>;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Radix Select reserves an empty string value to mean "no selection" —
    // 'none' is the sentinel mapped back to '' (→ null via the schema's
    // emptyToNull preprocessor) at the onValueChange boundary below.
    const categoryOptions = [
        { value: 'none', label: 'No category' },
        ...(categories ?? []).map((category) => ({ value: String(category.id), label: category.name })),
    ];

    const { field: categoryField } = useController({ control, name: 'categoryId' });
    const { field: availabilityField } = useController({ control, name: 'availabilityStatus' });

    const onSubmit = async (values: ProductFormValues) => {
        try {
            if (isEditMode) {
                await updateProduct({ id: product.id, payload: formValuesToPayload(values) }).unwrap();
            } else {
                const newId = await createProduct(formValuesToCreatePayload(values)).unwrap();
                router.push(`/admin/products/${newId}/edit`);
                return;
            }
        } catch (err) {
            const message = getErrorMessage(err);
            if (message.includes('products_base_price_nonneg')) {
                setError('basePrice', { type: 'server', message: 'Price must be 0 or more' });
            } else {
                setError('root', { type: 'server', message });
            }
        }
    };

    return (
        <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

            <AdminProductFormSection title="Basics">
                <FormField label="Title" error={errors.title?.message} {...register('title')} />
                <Select
                    label="Category"
                    options={categoryOptions}
                    value={(categoryField.value as string) || 'none'}
                    onValueChange={(value) => categoryField.onChange(value === 'none' ? '' : value)}
                    error={errors.categoryId?.message}
                />
                <FormField label="Brand" optional error={errors.brand?.message} {...register('brand')} />
                <FormField label="SKU" optional error={errors.sku?.message} {...register('sku')} />
                <Textarea label="Description" optional error={errors.description?.message} {...register('description')} />
            </AdminProductFormSection>

            <AdminProductFormSection title="Price">
                <FormField
                    label="Base price"
                    type="number"
                    step="0.01"
                    min={0}
                    error={errors.basePrice?.message}
                    {...register('basePrice')}
                />
                <FormField
                    label="Discount"
                    suffix="%"
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    optional
                    error={errors.discountPercentage?.message}
                    {...register('discountPercentage')}
                />
                <div className={style.pricePreview}>
                    <span className={style.pricePreviewLabel}>Final price</span>
                    <span className={style.pricePreviewValue}>${previewPrice.toFixed(2)}</span>
                </div>
                {isPriceDrop && (
                    <Alert variant="warning" icon={<LuTriangleAlert />}>
                        Lowering the price below ${product.price.toFixed(2)} will notify every customer who has this
                        product in their wishlist.
                    </Alert>
                )}
            </AdminProductFormSection>

            <AdminProductFormSection title="Media">
                <FormField label="Thumbnail URL" type="url" optional error={errors.thumbnail?.message} {...register('thumbnail')} />
                <AdminProductArrayField
                    label="Images"
                    name="images"
                    control={arrayFieldControl}
                    register={arrayFieldRegister}
                    errors={errors.images}
                    placeholder="https://…"
                    addLabel="Add image"
                    inputType="url"
                />
            </AdminProductFormSection>

            <AdminProductFormSection title="Logistics">
                <FormField
                    label="Weight"
                    suffix="kg"
                    type="number"
                    step="0.01"
                    min={0}
                    optional
                    error={errors.weight?.message}
                    {...register('weight')}
                />
                <FormField
                    label="Min. order quantity"
                    showStepper
                    type="number"
                    step="1"
                    min={1}
                    error={errors.minimumOrderQuantity?.message}
                    {...register('minimumOrderQuantity')}
                />
                <FormField
                    label="Width"
                    suffix="cm"
                    type="number"
                    step="0.01"
                    min={0}
                    error={errors.dimensions?.width?.message}
                    {...register('dimensions.width')}
                />
                <FormField
                    label="Height"
                    suffix="cm"
                    type="number"
                    step="0.01"
                    min={0}
                    error={errors.dimensions?.height?.message}
                    {...register('dimensions.height')}
                />
                <FormField
                    label="Depth"
                    suffix="cm"
                    type="number"
                    step="0.01"
                    min={0}
                    error={errors.dimensions?.depth?.message}
                    {...register('dimensions.depth')}
                />
                <Textarea
                    label="Shipping information"
                    optional
                    error={errors.shippingInformation?.message}
                    {...register('shippingInformation')}
                />
            </AdminProductFormSection>

            <AdminProductFormSection title="Additional">
                <Select
                    label="Availability status"
                    options={[...AVAILABILITY_STATUS_OPTIONS]}
                    value={availabilityField.value}
                    onValueChange={availabilityField.onChange}
                    error={errors.availabilityStatus?.message}
                />
                <Textarea
                    label="Warranty information"
                    optional
                    error={errors.warrantyInformation?.message}
                    {...register('warrantyInformation')}
                />
                <Textarea
                    label="Return policy"
                    optional
                    error={errors.returnPolicy?.message}
                    {...register('returnPolicy')}
                />
                <FormField label="Barcode" optional error={errors.barcode?.message} {...register('barcode')} />
                <FormField label="QR code" optional error={errors.qrCode?.message} {...register('qrCode')} />
                <AdminProductArrayField
                    label="Tags"
                    name="tags"
                    control={arrayFieldControl}
                    register={arrayFieldRegister}
                    errors={errors.tags}
                    placeholder="e.g. summer"
                    addLabel="Add tag"
                />
            </AdminProductFormSection>

            <AdminProductFormSection title="Sizes">
                {isEditMode ? (
                    <div className={style.sizesEditor}>
                        <AdminProductSizesEditor productId={product.id} />
                    </div>
                ) : (
                    <p className={style.sizesPlaceholder}>Save the product to add sizes.</p>
                )}
            </AdminProductFormSection>

            <div className={style.actions}>
                <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                    {isEditMode ? 'Save changes' : 'Create product'}
                </Button>
            </div>
        </form>
    );
};
