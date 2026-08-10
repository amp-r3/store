import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuTruck } from 'react-icons/lu';

import {
  AdminDeliveryMethod,
  UpdateDeliveryMethodPayload,
  useUpdateAdminDeliveryMethodMutation,
} from '@/entities/admin';
import { Alert, Button, FormField, Switch } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';

import { deliveryMethodSchema, DeliveryMethodFormValues } from '../../../model/methodSchemas';
import { AdminMethodDisableModal } from '../AdminMethodDisableModal/AdminMethodDisableModal';
import style from './admin-delivery-method-card.module.scss';

interface AdminDeliveryMethodCardProps {
  method: AdminDeliveryMethod;
}

export const AdminDeliveryMethodCard = ({ method }: AdminDeliveryMethodCardProps) => {
  const [updateMethod, { isLoading, error }] = useUpdateAdminDeliveryMethodMutation();
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<z.input<typeof deliveryMethodSchema>, unknown, DeliveryMethodFormValues>({
    resolver: zodResolver(deliveryMethodSchema),
    mode: 'onTouched',
    defaultValues: {
      name: method.name,
      price: method.price,
      estimatedTime: method.estimatedTime ?? '',
      freeFromPrice: method.freeFromPrice,
    },
  });

  const onSubmit = async (values: DeliveryMethodFormValues) => {
    // admin_update_delivery_method's payload is coalesce-guarded — an
    // absent key means "don't change", so only send what the admin
    // actually touched rather than the whole form every time.
    const payload: UpdateDeliveryMethodPayload = {
      ...(dirtyFields.name && { name: values.name }),
      ...(dirtyFields.price && { price: values.price }),
      ...(dirtyFields.estimatedTime && { estimatedTime: values.estimatedTime }),
      ...(dirtyFields.freeFromPrice && { freeFromPrice: values.freeFromPrice }),
    };

    try {
      await updateMethod({ id: method.id, payload }).unwrap();
      reset(values);
    } catch {
      // surfaced below via `error`
    }
  };

  const handleActiveChange = (next: boolean) => {
    if (next) {
      updateMethod({ id: method.id, payload: { isActive: true } });
    } else {
      setIsDisableModalOpen(true);
    }
  };

  const handleConfirmDisable = async () => {
    try {
      await updateMethod({ id: method.id, payload: { isActive: false } }).unwrap();
      setIsDisableModalOpen(false);
    } catch {
      // surfaced in the modal via the same mutation's `error`
    }
  };

  return (
    <div className={style['admin-delivery-method-card']}>
      <header className={style['admin-delivery-method-card__header']}>
        <div className={style['admin-delivery-method-card__title-group']}>
          <LuTruck aria-hidden="true" />
          <h3 className={style['admin-delivery-method-card__title']}>{method.name}</h3>
          <span className={style['admin-delivery-method-card__code']}>{method.code}</span>
        </div>
        <div className={style['admin-delivery-method-card__toggle']}>
          <Switch label="Active" checked={method.isActive} onChange={handleActiveChange} />
        </div>
      </header>

      <form
        className={style['admin-delivery-method-card__form']}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

        <div className={style['admin-delivery-method-card__fields']}>
          <FormField label="Name" error={errors.name?.message} {...register('name')} />
          <FormField
            label="Price"
            type="number"
            step="0.01"
            min={0}
            error={errors.price?.message}
            {...register('price')}
          />
          <FormField
            label="Estimated time"
            optional
            description="e.g. 2-4 business days"
            error={errors.estimatedTime?.message}
            {...register('estimatedTime')}
          />
          <FormField
            label="Free shipping from"
            type="number"
            step="0.01"
            min={0}
            optional
            description="Leave empty to disable free shipping for this method"
            error={errors.freeFromPrice?.message}
            {...register('freeFromPrice')}
          />
        </div>

        <div className={style['admin-delivery-method-card__actions']}>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!isDirty}>
            Save
          </Button>
        </div>
      </form>

      <AdminMethodDisableModal
        isOpen={isDisableModalOpen}
        onOpenChange={setIsDisableModalOpen}
        methodName={method.name}
        isLoading={isLoading}
        error={error}
        onConfirm={handleConfirmDisable}
      />
    </div>
  );
};
