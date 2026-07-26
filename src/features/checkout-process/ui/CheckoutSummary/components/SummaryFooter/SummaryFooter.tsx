import { HiArrowRight } from 'react-icons/hi';
import { useCheckoutContext } from '../../../../model/CheckoutContext';
import { CHECKOUT_STEPS } from '../../../../model/checkoutConfig';
import { formatPrice } from '@/shared/lib';
import { SummaryTotalRow } from '../SummaryTotalRow/SummaryTotalRow';
import style from './summary-footer.module.scss';

export const SummaryFooter = () => {
  const { orderTotals, step, isLastStep, isSubmitting, goNext } = useCheckoutContext();
  const { cta, ctaIcon } = CHECKOUT_STEPS[step];

  return (
    <div className={style.footer}>
      <SummaryTotalRow isFinal label="Total" value={formatPrice(orderTotals.finalTotalPrice)} />

      <button
        className={style.cta}
        disabled={isSubmitting}
        type={isLastStep ? 'submit' : 'button'}
        form={isLastStep ? 'checkout-form' : undefined}
        onClick={isLastStep ? undefined : goNext}
      >
        {isSubmitting ? 'Loading...' : (
          <>
            <span className={style['cta__icon_step']}>
              {ctaIcon}
            </span>
            <span className={style['cta__label']}>
              {cta}
            </span>
            <span className={style['cta__icon_arrow']}>
              <HiArrowRight />
            </span>
          </>
        )}
      </button>
    </div>
  );
};
