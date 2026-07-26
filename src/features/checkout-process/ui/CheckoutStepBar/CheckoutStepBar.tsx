import { Fragment } from 'react';
import { STEPS_ORDER } from '../../model/types';
import { CHECKOUT_STEPS } from '../../model/checkoutConfig';
import { useCheckoutContext } from '../../model/CheckoutContext';
import style from './checkout-step-bar.module.scss';

export const CheckoutStepBar = () => {
  const { step: currentStep, maxReachedIndex, goToStep } = useCheckoutContext();

  return (
    <nav className={style['step-bar']}>
      {
        STEPS_ORDER.map((step, index) => {
          const isClickable = index <= maxReachedIndex;
          const isActive = step === currentStep;
          const config = CHECKOUT_STEPS[step];
          const isLast = index === STEPS_ORDER.length - 1;

          return (
            <Fragment key={step}>
              <button
                type="button"
                className={`${style['step-bar__tab']} ${isActive ? style['step-bar__tab--active'] : ''}`}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => goToStep(step)}
              >
                <span className={style['step-bar__num']}>{config.order}</span>
                <span className={style['step-bar__label']}>{config.label}</span>
                <span className={style['step-bar__icon']}>
                  {isActive ? config.iconActive : config.icon}
                </span>
              </button>
              {!isLast && <div className={style['step-bar__divider']} />}
            </Fragment>
          )
        })
      }
    </nav>
  );
};
