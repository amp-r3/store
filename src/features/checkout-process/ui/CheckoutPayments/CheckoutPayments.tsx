import { PaymentOption, PaymentOptionSkeleton } from './components';
import style from './checkout-payments.module.scss';
import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../model/checkoutMasterSchema';
import { useCheckoutContext } from '../../model/CheckoutContext';
import { PAYMENT_CONFIG } from '@/entities/order';
import { InfoBanner, Alert } from '@/shared/ui';

export const CheckoutPayments = () => {
  const {
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();
  const { paymentMethods, selectedPayment, isPaymentLoading, selectPayment } = useCheckoutContext();

  const paymentInfo = PAYMENT_CONFIG.find((m) => m.id === selectedPayment?.code);
  const banner = paymentInfo?.banner;

  return (
    <section className={style['payment']}>
      <div className={style['payment__group-block']}>
        {errors.paymentMethodId && <Alert variant="error">{errors.paymentMethodId.message}</Alert>}
        <h3 className={style['payment__title']}>Payment method</h3>

        <div
          className={style['payment__methods-grid']}
          role="radiogroup"
          aria-label="Payment method"
        >
          {isPaymentLoading
            ? Array.from({ length: 5 }).map((_, i) => <PaymentOptionSkeleton key={i} />)
            : paymentMethods?.map((opt) => {
                const ui = PAYMENT_CONFIG.find((m) => m.id === opt.code);
                if (!ui) return null;
                const isSelected = selectedPayment?.id === opt.id;
                return (
                  <PaymentOption
                    key={opt.id}
                    option={opt}
                    icon={ui.icon}
                    label={ui.label}
                    handleSelect={selectPayment}
                    isSelected={isSelected}
                  />
                );
              })}
        </div>
      </div>

      {banner && (
        <>
          <div className={style['payment__divider']} role="presentation" />
          <div className={style['payment__group-block']}>
            <InfoBanner {...banner} />
          </div>
        </>
      )}
    </section>
  );
};
