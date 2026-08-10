import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { useCheckoutContext } from '../../model/CheckoutContext';
import { CHECKOUT_STEPS } from '../../model/checkoutConfig';
import { STEPS_ORDER } from '../../model/types';
import { formatPrice } from '@/shared/lib';
import { Loader } from '@/shared/ui';
import { SummaryTotalRow } from '../CheckoutSummary/components';
import style from './checkout-step-actions.module.scss';

interface CheckoutStepActionsProps {
  variant?: 'inline' | 'bar';
}

export const CheckoutStepActions = ({ variant = 'inline' }: CheckoutStepActionsProps) => {
  const { step, stepIndex, isLastStep, isSubmitting, goNext, goToStep, orderTotals } =
    useCheckoutContext();
  const { cta, ctaIcon } = CHECKOUT_STEPS[step];

  return (
    <div className={`${style.actions} ${variant === 'bar' ? style['actions--bar'] : ''}`}>
      {variant === 'bar' && (
        <SummaryTotalRow isFinal label="Total" value={formatPrice(orderTotals.finalTotalPrice)} />
      )}

      <div className={style.actions__buttons}>
        {stepIndex > 0 && (
          <button
            type="button"
            className={style.actions__back}
            onClick={() => goToStep(STEPS_ORDER[stepIndex - 1])}
          >
            <HiArrowLeft />
            <span>Back</span>
          </button>
        )}

        <button
          className={style.actions__cta}
          disabled={isSubmitting}
          type={isLastStep ? 'submit' : 'button'}
          form={isLastStep ? 'checkout-form' : undefined}
          onClick={isLastStep ? undefined : goNext}
        >
          {isSubmitting ? (
            <Loader size="sm" />
          ) : (
            <>
              <span className={style['actions__cta-icon-step']}>{ctaIcon}</span>
              <span className={style['actions__cta-label']}>{cta}</span>
              <span className={style['actions__cta-icon-arrow']}>
                <HiArrowRight />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
