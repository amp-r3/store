import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Control, UseFormRegister } from 'react-hook-form';
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
import { AdminProductFormSection, AdminProductArrayField } from './components';

import style from './admin-product-form.module.scss';

interface AdminProductFormProps {
    product?: AdminProductDetail;
}

export const AdminProductForm = ({ product }: AdminProductFormProps) => {
    const navigate = useNavigate();
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

    const categoryOptions = [
        { value: '', label: 'No category' },
        ...(categories ?? []).map((category) => ({ value: String(category.id), label: category.name })),
    ];

    const onSubmit = async (values: ProductFormValues) => {
        try {
            if (isEditMode) {
                await updateProduct({ id: product.id, payload: formValuesToPayload(values) }).unwrap();
            } else {
                const newId = await createProduct(formValuesToCreatePayload(values)).unwrap();
                navigate(`/admin/products/${newId}/edit`);
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
                    error={errors.categoryId?.message}
                    {...register('categoryId')}
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
                    label="Discount %"
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
                <FormField label="Thumbnail URL" optional error={errors.thumbnail?.message} {...register('thumbnail')} />
                <AdminProductArrayField
                    label="Images"
                    name="images"
                    control={arrayFieldControl}
                    register={arrayFieldRegister}
                    errors={errors.images}
                    placeholder="https://…"
                    addLabel="Add image"
                />
            </AdminProductFormSection>

            <AdminProductFormSection title="Logistics">
                <FormField
                    label="Weight (kg)"
                    type="number"
                    step="0.01"
                    min={0}
                    optional
                    error={errors.weight?.message}
                    {...register('weight')}
                />
                <FormField
                    label="Min. order quantity"
                    type="number"
                    step="1"
                    min={1}
                    error={errors.minimumOrderQuantity?.message}
                    {...register('minimumOrderQuantity')}
                />
                <FormField
                    label="Width (cm)"
                    type="number"
                    step="0.01"
                    min={0}
                    error={errors.dimensions?.width?.message}
                    {...register('dimensions.width')}
                />
                <FormField
                    label="Height (cm)"
                    type="number"
                    step="0.01"
                    min={0}
                    error={errors.dimensions?.height?.message}
                    {...register('dimensions.height')}
                />
                <FormField
                    label="Depth (cm)"
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
                    error={errors.availabilityStatus?.message}
                    {...register('availabilityStatus')}
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

            <div className={style.actions}>
                <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                    {isEditMode ? 'Save changes' : 'Create product'}
                </Button>
            </div>
        </form>
    );
};
