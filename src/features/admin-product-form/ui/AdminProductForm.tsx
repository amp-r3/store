import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuTriangleAlert } from 'react-icons/lu';

import { FormField, Textarea, Select, Button, Alert, showToast } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import { useHaptics } from '@/shared/lib/hooks';
import {
  AdminProductDetail,
  useGetAdminCategoriesQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
} from '@/entities/admin';

import { productSchema, ProductFormValues } from '../model/productSchema';
import {
  DEFAULT_PRODUCT_FORM_VALUES,
  productDetailToFormValues,
  formValuesToPayload,
  formValuesToCreatePayload,
} from '../model/productFormMapping';
import { calculatePrice } from '../model/calculatePrice';
import {
  buildProductChanges,
  hasProductChanges,
  ProductChanges,
} from '../model/buildProductChanges';
import { AVAILABILITY_STATUS_OPTIONS } from '../config/availabilityStatusOptions';
import { useProductMediaDraft } from '../lib/useProductMediaDraft';
import {
  AdminProductFormSection,
  AdminProductFormCol,
  AdminProductSizesEditor,
  AdminProductTagsField,
  AdminProductMediaFields,
  AdminProductChangesModal,
} from './components';

import style from './admin-product-form.module.scss';

interface AdminProductFormProps {
  product?: AdminProductDetail;
}

export const AdminProductForm = ({ product }: AdminProductFormProps) => {
  const router = useRouter();
  const { success } = useHaptics();
  const isEditMode = !!product;

  const { data: categories } = useGetAdminCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();
  const mediaDraft = useProductMediaDraft(product);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const isSaving = isCreating || isUpdating || isUploadingMedia;

  const [pending, setPending] = useState<{
    values: ProductFormValues;
    changes: ProductChanges;
  } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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
    if (!isEditMode) {
      try {
        const newId = await createProduct(formValuesToCreatePayload(values)).unwrap();
        router.push(`/admin/products/${newId}/edit`);
      } catch (err) {
        setError('root', { type: 'server', message: getErrorMessage(err) });
      }
      return;
    }

    const changes = buildProductChanges(
      productDetailToFormValues(product),
      values,
      categories ?? [],
      mediaDraft,
    );
    if (!hasProductChanges(changes)) {
      showToast('info', 'No changes to save', { key: 'admin-product' });
      return;
    }

    setConfirmError(null);
    setPending({ values, changes });
  };

  const handleConfirm = async () => {
    if (!pending || !product) return;

    try {
      setIsUploadingMedia(true);
      let mediaPayload;
      try {
        mediaPayload = await mediaDraft.commit();
      } finally {
        setIsUploadingMedia(false);
      }
      await updateProduct({
        id: product.id,
        payload: { ...formValuesToPayload(pending.values), ...mediaPayload },
      }).unwrap();
      success();
      setPending(null);
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes('products_base_price_nonneg')) {
        setError('basePrice', { type: 'server', message: 'Price must be 0 or more' });
        setPending(null);
      } else {
        setConfirmError(message);
      }
    }
  };

  return (
    <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <AdminProductFormSection title="Basics">
        <AdminProductFormCol span={6}>
          <FormField
            label="Title"
            labelPlacement="stacked"
            error={errors.title?.message}
            {...register('title')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={6}>
          <Select
            label="Category"
            options={categoryOptions}
            value={(categoryField.value as string) || 'none'}
            onValueChange={(value) => categoryField.onChange(value === 'none' ? '' : value)}
            error={errors.categoryId?.message}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={6}>
          <FormField
            label="Brand"
            labelPlacement="stacked"
            optional
            error={errors.brand?.message}
            {...register('brand')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={6}>
          <FormField
            label="SKU"
            labelPlacement="stacked"
            optional
            error={errors.sku?.message}
            {...register('sku')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={12}>
          <Textarea
            label="Description"
            optional
            rows={6}
            error={errors.description?.message}
            {...register('description')}
          />
        </AdminProductFormCol>
      </AdminProductFormSection>

      <AdminProductFormSection title="Price">
        <AdminProductFormCol span={4} spanMd={6}>
          <FormField
            label="Base price"
            labelPlacement="stacked"
            type="number"
            step="0.01"
            min={0}
            error={errors.basePrice?.message}
            {...register('basePrice')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={4} spanMd={6}>
          <FormField
            label="Discount"
            labelPlacement="stacked"
            suffix="%"
            type="number"
            step="0.01"
            min={0}
            max={100}
            optional
            error={errors.discountPercentage?.message}
            {...register('discountPercentage')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={4} spanMd={12}>
          <div className={style.pricePreview}>
            <span className={style.pricePreviewLabel}>Final price</span>
            <span className={style.pricePreviewValue}>${previewPrice.toFixed(2)}</span>
          </div>
        </AdminProductFormCol>
        {isPriceDrop && (
          <AdminProductFormCol span={12}>
            <Alert variant="warning" icon={<LuTriangleAlert />}>
              Lowering the price below ${product.price.toFixed(2)} will notify every customer who
              has this product in their wishlist.
            </Alert>
          </AdminProductFormCol>
        )}
      </AdminProductFormSection>

      <AdminProductFormSection title="Media">
        <AdminProductFormCol span={12}>
          <AdminProductMediaFields product={product} draft={mediaDraft} />
        </AdminProductFormCol>
      </AdminProductFormSection>

      <AdminProductFormSection title="Logistics">
        <AdminProductFormCol span={6}>
          <FormField
            label="Weight"
            labelPlacement="stacked"
            suffix="kg"
            type="number"
            step="0.01"
            min={0}
            optional
            error={errors.weight?.message}
            {...register('weight')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={6}>
          <FormField
            label="Min. order quantity"
            labelPlacement="stacked"
            showStepper
            type="number"
            step="1"
            min={1}
            error={errors.minimumOrderQuantity?.message}
            {...register('minimumOrderQuantity')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={4}>
          <FormField
            label="Width"
            labelPlacement="stacked"
            suffix="cm"
            type="number"
            step="0.01"
            min={0}
            error={errors.dimensions?.width?.message}
            {...register('dimensions.width')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={4}>
          <FormField
            label="Height"
            labelPlacement="stacked"
            suffix="cm"
            type="number"
            step="0.01"
            min={0}
            error={errors.dimensions?.height?.message}
            {...register('dimensions.height')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={4}>
          <FormField
            label="Depth"
            labelPlacement="stacked"
            suffix="cm"
            type="number"
            step="0.01"
            min={0}
            error={errors.dimensions?.depth?.message}
            {...register('dimensions.depth')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={12}>
          <Textarea
            label="Shipping information"
            optional
            rows={4}
            error={errors.shippingInformation?.message}
            {...register('shippingInformation')}
          />
        </AdminProductFormCol>
      </AdminProductFormSection>

      <AdminProductFormSection title="Additional">
        <AdminProductFormCol span={6} spanMd={12}>
          <Select
            label="Availability status"
            options={[...AVAILABILITY_STATUS_OPTIONS]}
            value={availabilityField.value}
            onValueChange={availabilityField.onChange}
            error={errors.availabilityStatus?.message}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={3} spanMd={6}>
          <FormField
            label="Barcode"
            labelPlacement="stacked"
            optional
            error={errors.barcode?.message}
            {...register('barcode')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={3} spanMd={6}>
          <FormField
            label="QR code"
            labelPlacement="stacked"
            optional
            error={errors.qrCode?.message}
            {...register('qrCode')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={6}>
          <Textarea
            label="Warranty information"
            optional
            error={errors.warrantyInformation?.message}
            {...register('warrantyInformation')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={6}>
          <Textarea
            label="Return policy"
            optional
            error={errors.returnPolicy?.message}
            {...register('returnPolicy')}
          />
        </AdminProductFormCol>
        <AdminProductFormCol span={12}>
          <AdminProductTagsField control={control} error={errors.tags?.message} />
        </AdminProductFormCol>
      </AdminProductFormSection>

      <AdminProductFormSection title="Sizes">
        <AdminProductFormCol span={12}>
          {isEditMode ? (
            <AdminProductSizesEditor productId={product.id} />
          ) : (
            <p className={style.sizesPlaceholder}>Save the product to add sizes.</p>
          )}
        </AdminProductFormCol>
      </AdminProductFormSection>

      <div className={style.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/products')}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSaving}>
          {isEditMode ? 'Save changes' : 'Create product'}
        </Button>
      </div>

      {isEditMode && (
        <AdminProductChangesModal
          isOpen={!!pending}
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
          productTitle={product.title}
          changes={pending?.changes ?? null}
          error={confirmError}
          isLoading={isSaving}
          onConfirm={handleConfirm}
        />
      )}
    </form>
  );
};
