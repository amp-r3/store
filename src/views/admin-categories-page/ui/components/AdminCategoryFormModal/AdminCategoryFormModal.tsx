import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal, FormField, Alert } from '@/shared/ui';
import { getErrorMessage, slugify } from '@/shared/lib';
import { AdminCategory, useUpsertAdminCategoryMutation } from '@/entities/admin';

import { categorySchema, CategorySchema } from '../../../model/categorySchema';
import style from './admin-category-form-modal.module.scss';

interface AdminCategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategory | null;
}

export const AdminCategoryFormModal = ({
  isOpen,
  onOpenChange,
  category,
}: AdminCategoryFormModalProps) => {
  const [upsertCategory, { isLoading }] = useUpsertAdminCategoryMutation();
  const [slugTouchedByUser, setSlugTouchedByUser] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    mode: 'onTouched',
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (isOpen) {
      setRootError(null);
      setSlugTouchedByUser(false);
      reset(category ? { name: category.name, slug: category.slug } : { name: '', slug: '' });
    }
  }, [isOpen, category, reset]);

  const name = watch('name');
  const slug = watch('slug');

  // Auto-derives the slug from the name until the admin edits it directly —
  // once touched, typing in Name no longer overwrites a deliberate slug.
  useEffect(() => {
    if (!slugTouchedByUser) {
      setValue('slug', slugify(name), { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const slugChanged = !!category && slug !== category.slug;

  const onSubmit = async (values: CategorySchema) => {
    setRootError(null);
    try {
      await upsertCategory({
        id: category?.id ?? null,
        name: values.name,
        slug: values.slug,
      }).unwrap();
      onOpenChange(false);
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes('categories_slug_key')) {
        setError('slug', { type: 'server', message: 'This slug is already in use' });
      } else {
        setRootError(message);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={category ? 'Edit category' : 'New category'}
      actionLabel={category ? 'Save changes' : 'Create'}
      onAction={handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {rootError && <Alert variant="error">{rootError}</Alert>}

        <FormField label="Name" error={errors.name?.message} {...register('name')} />

        <FormField
          label="Slug"
          error={errors.slug?.message}
          description={!errors.slug ? 'Used in catalog URLs' : undefined}
          warning={
            slugChanged
              ? 'Changing the slug breaks existing links that use the old one.'
              : undefined
          }
          {...register('slug', { onChange: () => setSlugTouchedByUser(true) })}
        />
      </form>
    </Modal>
  );
};
