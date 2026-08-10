import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCreditCard } from 'react-icons/lu';

import {
  AdminPaymentMethod,
  UpdatePaymentMethodPayload,
  useUpdateAdminPaymentMethodMutation,
} from '@/entities/admin';
import { Alert, Button, FormField, Switch } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import { paymentMethodSchema, PaymentMethodFormValues } from '../../../model/methodSchemas';
import { AdminMethodDisableModal } from '../AdminMethodDisableModal/AdminMethodDisableModal';
import style from './admin-payment-method-card.module.scss';

const EXAMPLE_ORDER_TOTAL = 100;

interface AdminPaymentMethodCardProps {
  method: AdminPaymentMethod;
}

export const AdminPaymentMethodCard = ({ method }: AdminPaymentMethodCardProps) => {
  const [updateMethod, { isLoading, error }] = useUpdateAdminPaymentMethodMutation();
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<z.input<typeof paymentMethodSchema>, unknown, PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    mode: 'onTouched',
    defaultValues: {
      name: method.name,
      feePercentage: method.feePercentage,
      feeFixed: method.feeFixed,
    },
  });

  // Live preview so the admin sees the effect of a percentage + fixed fee
  // combination before saving, not just after the fact.
  const [feePercentage, feeFixed] = watch(['feePercentage', 'feeFixed']);
  const exampleFee =
    EXAMPLE_ORDER_TOTAL * ((Number(feePercentage) || 0) / 100) + (Number(feeFixed) || 0);

  const onSubmit = async (values: PaymentMethodFormValues) => {
    const payload: UpdatePaymentMethodPayload = {
      ...(dirtyFields.name && { name: values.name }),
      ...(dirtyFields.feePercentage && { feePercentage: values.feePercentage }),
      ...(dirtyFields.feeFixed && { feeFixed: values.feeFixed }),
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
    <div className={style['admin-payment-method-card']}>
      <header className={style['admin-payment-method-card__header']}>
        <div className={style['admin-payment-method-card__title-group']}>
          <LuCreditCard aria-hidden="true" />
          <h3 className={style['admin-payment-method-card__title']}>{method.name}</h3>
          <span className={style['admin-payment-method-card__code']}>{method.code}</span>
        </div>
        <div className={style['admin-payment-method-card__toggle']}>
          <Switch label="Active" checked={method.isActive} onChange={handleActiveChange} />
        </div>
      </header>

      <form
        className={style['admin-payment-method-card__form']}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

        <div className={style['admin-payment-method-card__fields']}>
          <FormField label="Name" error={errors.name?.message} {...register('name')} />
          <FormField
            label="Fee"
            suffix="%"
            type="number"
            step="0.01"
            min={0}
            max={100}
            error={errors.feePercentage?.message}
            {...register('feePercentage')}
          />
          <FormField
            label="Fixed fee"
            type="number"
            step="0.01"
            min={0}
            error={errors.feeFixed?.message}
            {...register('feeFixed')}
          />
        </div>

        <p className={style['admin-payment-method-card__example']}>
          On a {formatPrice(EXAMPLE_ORDER_TOTAL)} order: <strong>{formatPrice(exampleFee)}</strong>{' '}
          fee
        </p>

        <div className={style['admin-payment-method-card__actions']}>
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
