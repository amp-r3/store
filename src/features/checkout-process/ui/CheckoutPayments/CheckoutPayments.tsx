import { PaymentOption, PaymentOptionSkeleton } from "./components";
import style from './checkout-payments.module.scss'
import { useFormContext } from 'react-hook-form'
import { CheckoutFormValues } from '@/features/checkout-process/model/checkoutMasterSchema'
import { FC, useEffect } from 'react'
import { PaymentMethod, PaymentOptions } from '@/features/checkout-process/model/types';
import { PAYMENT_CONFIG } from '@/shared/config';

interface CheckoutPaymentsProps {
  paymentMethods?: PaymentMethod[];
  isLoading: boolean;
  handleSelect(id: string, code: PaymentOptions): void
}

export const CheckoutPayments: FC<CheckoutPaymentsProps> = ({ paymentMethods, isLoading, handleSelect }) => {
  const { watch, formState: { errors, isSubmitted } } = useFormContext<CheckoutFormValues>()
  const currentPaymentMethod = watch('paymentMethodId')

  const selectedMethod = paymentMethods?.find(m => m?.id === currentPaymentMethod)
  const paymentInfo = PAYMENT_CONFIG.find(m => m.id === selectedMethod?.code)
  const banner = paymentInfo?.banner

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !currentPaymentMethod) {
      handleSelect(paymentMethods[0].id, paymentMethods[0].code);
    }
  }, [paymentMethods, currentPaymentMethod, handleSelect]);

  return (
    <section className={style['payment']}>
      <div className={style['payment__wrapper']}>
        {errors.paymentMethodId && isSubmitted && (
          <div className={style['payment__message']} role="alert">
            {errors.paymentMethodId.message}
          </div>
        )}
        <h2 className={style['payment__title']}>Payment method</h2>

        <div className={style['payment__methods-grid']}>
          {
            isLoading ? Array.from({ length: 5 }).map((_, i) => <PaymentOptionSkeleton key={i} />) :
              paymentMethods?.map(opt => {
                const ui = PAYMENT_CONFIG.find(m => m.id === opt.code);
                if (!ui) return null;
                const isSelected = currentPaymentMethod === opt.id
                return (
                  <PaymentOption
                    key={opt.id}
                    option={opt}
                    icon={ui.icon}
                    label={ui.label}
                    handleSelect={handleSelect}
                    isSelected={isSelected} />
                )
              })

          }
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