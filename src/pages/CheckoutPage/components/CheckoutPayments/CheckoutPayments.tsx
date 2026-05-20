import { FormField } from '@/components/common'
import style from './checkout-payments.module.scss'
import { FaUser, FaLock, FaShieldAlt } from 'react-icons/fa'
import { BsCalendar2Date, BsCreditCard2Front } from 'react-icons/bs'
import { LuBanknote, LuHandCoins, LuClipboardCheck, LuCircleAlert } from 'react-icons/lu'
import { useFormContext } from 'react-hook-form'
import { CheckoutFormValues } from '@/schemas/checkoutMasterSchema'
import { FC } from 'react'
import { PaymentOption } from '../../CheckoutPage'

interface CheckoutPaymentsProps {
  paymentMethods: PaymentOption[];
}

export const CheckoutPayments: FC<CheckoutPaymentsProps> = ({ paymentMethods }) => {
  const { register, watch, formState: { errors } } = useFormContext<CheckoutFormValues>();
  const currentPaymentMethod = watch("paymentMethod")
  return (
    <section className={style['payment']}>
      <div className={style['payment__wrapper']}>
        <h2 className={style['payment__title']}>Payment method</h2>
        {
          paymentMethods.map(opt => {
            const isSelected = currentPaymentMethod === opt.id;
            return (
              <label
                key={opt.id}
                className={`${style['payment__card-option']}  ${isSelected ? style['payment__card-option--active'] : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.id}
                  className={style['payment__card-option__radio']}
                  {...register("paymentMethod")}
                />
                <span className={style['payment__card-option__dot']}></span>
                <span className={style['payment__card-option__icon']}>{opt.icon}</span>
                <div className={style['payment__card-option__info']}>
                  <span className={style['payment__card-option__label']}>{opt.label}</span>
                </div>
              </label>
            )
          })
        }

      </div>

      <div className={style['payment__wrapper']}>
        {
          currentPaymentMethod === 'online' ?
            <>
              <h2 className={style['payment__title']}>Card Details</h2>

              <FormField
                icon={<FaUser />}
                label='Cardholder Name'
                placeholder="John Doe"
                error={errors.cardHolder?.message}
                {...register('cardHolder')}
              />
              <FormField
                icon={<BsCreditCard2Front />}
                label='Card Number'
                placeholder="0000 0000 0000 0000"
                error={errors.cardNumber?.message}
                {...register('cardNumber')}
              />

              <div className={style['payment__row']}>
                <FormField
                  icon={<BsCalendar2Date />}
                  label='Expiry Date'
                  placeholder="MM / YY"
                  error={errors.cardDate?.message}
                  {...register('cardDate')}
                />
                <FormField
                  icon={<FaLock />}
                  label='CVC'
                  type='password'
                  placeholder="•••"
                  error={errors.cvc?.message}
                  {...register('cvc')}
                />
              </div>

              <div className={style['payment__secure-note']}>
                <FaShieldAlt />
                256-bit TSL encrypted · Your data is safe
              </div>
            </> :
            <div className={style['payment__cash-banner']}>
              <div className={style['payment__cash-banner__icon-wrap']}>
                <LuBanknote aria-hidden="true" />
              </div>
              <div className={style['payment__cash-banner__body']}>
                <span className={style['payment__cash-banner__title']}>Pay upon delivery</span>
                <p className={style['payment__cash-banner__description']}>
                  Our courier will collect payment when your order arrives. Please have the exact amount ready — change may not always be available.
                </p>
                <ul className={style['payment__cash-banner__details']}>
                  <li>
                    <LuHandCoins aria-hidden="true" />
                    Cash or card accepted at the door
                  </li>
                  <li>
                    <LuClipboardCheck aria-hidden="true" />
                    You'll receive an invoice after delivery
                  </li>
                  <li>
                    <LuCircleAlert aria-hidden="true" />
                    No charges until your order is delivered
                  </li>
                </ul>
              </div>
            </div>
        }

      </div>
    </section>
  )
}