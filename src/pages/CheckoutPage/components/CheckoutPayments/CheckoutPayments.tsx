import style from './checkout-payments.module.scss'
import { useFormContext } from 'react-hook-form'
import { CheckoutFormValues } from '@/schemas/checkoutMasterSchema'
import { FC } from 'react'
import { PaymentOption } from '@/config/payment.config';

interface CheckoutPaymentsProps {
  paymentMethods: PaymentOption[];
}

export const CheckoutPayments: FC<CheckoutPaymentsProps> = ({ paymentMethods }) => {
  const { register, watch } = useFormContext<CheckoutFormValues>()
  const currentPaymentMethod = watch('paymentMethod')

  const selectedMethod = paymentMethods.find(m => m.id === currentPaymentMethod)
  const banner = selectedMethod?.banner

  return (
    <section className={style['payment']}>
      <div className={style['payment__wrapper']}>
        <h2 className={style['payment__title']}>Payment method</h2>

        <div className={style['payment__methods-grid']}>
          {paymentMethods.map(opt => {
            const isSelected = currentPaymentMethod === opt.id
            return (
              <label
                key={opt.id}
                className={`${style['payment__method-card']} ${isSelected ? style['payment__method-card--active'] : ''}`}
              >
                <input
                  type="radio"
                  value={opt.id}
                  className={style['payment__method-card__radio']}
                  {...register('paymentMethod')}
                />
                <span className={style['payment__method-card__icon']}>{opt.icon}</span>
                <span className={style['payment__method-card__label']}>{opt.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {banner && (
        <div className={style['payment__wrapper']}>
          <div className={style['payment__cash-banner']}>
            <div className={style['payment__cash-banner__icon-wrap']}>
              {banner.icon}
            </div>
            <div className={style['payment__cash-banner__body']}>
              <span className={style['payment__cash-banner__title']}>{banner.title}</span>
              <p className={style['payment__cash-banner__description']}>{banner.description}</p>
              <ul className={style['payment__cash-banner__details']}>
                {banner.details.map((item, i) => (
                  <li key={i}>
                    {item.icon}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}