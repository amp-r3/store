import { CheckoutFormValues } from '../../model/checkoutMasterSchema';
import { useCheckoutContext } from '../../model/CheckoutContext';
import style from './checkout-contacts.module.scss';
import { FormField, MaskedFormField } from '@/shared/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { PHONE_MASK } from '@/shared/config';

export const CheckoutContacts = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();
  const { hasPreviousAddress, showPreviousAddressChip, applyPreviousAddress } =
    useCheckoutContext();

  return (
    <section className={style['contacts']}>
      {showPreviousAddressChip && hasPreviousAddress && (
        <button type="button" className={style['contacts__prefill']} onClick={applyPreviousAddress}>
          Use my previous address
        </button>
      )}
      <div className={style['contacts__row']}>
        <FormField
          label="First name"
          placeholder="John"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <FormField
          label="Last name"
          placeholder="Doe"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <FormField
        label="Email"
        type="email"
        placeholder="john@example.com"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <MaskedFormField
            ref={field.ref}
            label="Phone"
            placeholder="+15551234567"
            maskOptions={PHONE_MASK}
            value={field.value ?? ''}
            onAccept={field.onChange}
            onBlur={field.onBlur}
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
          />
        )}
      />
    </section>
  );
};
