import { CheckoutFormValues } from '@/features/checkout-process/model/checkoutMasterSchema';
import style from './checkout-contacts.module.scss'
import { FormField } from "@/shared/ui";
import { useFormContext } from 'react-hook-form';

export const CheckoutContacts = () => {

  const { register, formState: { errors } } = useFormContext<CheckoutFormValues>();


  return (
    <section className={style['contacts']}>
      <h2 className={style['contacts__title']}>Recipient's contacts</h2>
      <div className={style['contacts__row']}>
        <FormField
          label="First name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <FormField
          label="Last name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <FormField
        label="Email"
        type="email"
        placeholder="john@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Phone"
        placeholder="+1 (000) 000-0000"
        error={errors.phone?.message}
        {...register('phone')}
      />
    </section>
  )
}