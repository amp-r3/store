import { CheckoutFormValues } from '@/schemas/checkoutMasterSchema';
import style from './checkout-contacts.module.scss'
import { FormField } from "@/components/common";
import { SessionUser } from "@/types/auth";
import { FC } from "react";
import { useFormContext } from 'react-hook-form';

interface CheckoutContactsProps {
  user: SessionUser;
}

export const CheckoutContacts: FC<CheckoutContactsProps> = ({ user }) => {

  const { register, formState: { errors } } = useFormContext<CheckoutFormValues>();


  return (
    <section className={style['contacts']}>
      <h2 className={style['contacts__title']}>Recipient's contacts</h2>
      <div className={style['contacts__row']}>
        <FormField
          label="First name"
          value={user.firstName}
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <FormField
          label="Last name"
          value={user.lastName}
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <FormField
        label="Email"
        type="email"
        value={user.email}
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