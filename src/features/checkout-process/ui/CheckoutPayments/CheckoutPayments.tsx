import { FaCreditCard } from 'react-icons/fa';
import { PaymentOption, PaymentOptionSkeleton } from './components';
import style from './checkout-payments.module.scss';
import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../model/checkoutMasterSchema';
import { useCheckoutContext } from '../../model/CheckoutContext';
import { PAYMENT_CONFIG } from '@/entities/order';
import { InfoBanner, Alert, Button } from '@/shared/ui';

// A server payment method not present in PAYMENT_CONFIG (config drift) still
// renders with this fallback, instead of being silently dropped. Hoisted so
// its identity is stable across renders — inline JSX here would defeat
// PaymentOption's React.memo on every parent re-render.
const FALLBACK_PAYMENT_ICON = <FaCreditCard aria-hidden="true" />;

export const CheckoutPayments = () => {
  const {
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();
  const {
    paymentMethods,
    selectedPayment,
    isPaymentLoading,
    isPaymentError,
    refetchPaymentMethods,
    selectPayment,
  } = useCheckoutContext();

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
          {isPaymentLoading ? (
            Array.from({ length: 5 }).map((_, i) => <PaymentOptionSkeleton key={i} />)
          ) : isPaymentError ? (
            <Alert variant="error">
              Couldn&apos;t load payment methods.{' '}
              <Button type="button" variant="ghost" onClick={refetchPaymentMethods}>
                Retry
              </Button>
            </Alert>
          ) : (
            paymentMethods?.map((opt) => {
              const ui = PAYMENT_CONFIG.find((m) => m.id === opt.code);
              const isSelected = selectedPayment?.id === opt.id;
              return (
                <PaymentOption
                  key={opt.id}
                  option={opt}
                  icon={ui?.icon ?? FALLBACK_PAYMENT_ICON}
                  label={ui?.label ?? opt.name}
                  handleSelect={selectPayment}
                  isSelected={isSelected}
                />
              );
            })
          )}
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
