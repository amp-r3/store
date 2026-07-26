import { CheckoutFormValues } from '@/features/checkout-process/model/checkoutMasterSchema';
import style from './checkout-contacts.module.scss'
import { FormField, MaskedFormField } from "@/shared/ui";
import { Controller, useFormContext } from 'react-hook-form';
import { PHONE_MASK } from '@/shared/config';

export const CheckoutContacts = () => {

  const { register, control, formState: { errors } } = useFormContext<CheckoutFormValues>();


  return (
    <section className={style['contacts']}>
      <h2 className={style['contacts__title']}>Recipient's contacts</h2>
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
            label="Phone"
            placeholder="+1 (000) 000-0000"
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
  )
}
