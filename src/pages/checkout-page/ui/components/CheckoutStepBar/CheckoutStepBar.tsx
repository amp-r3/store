import { STEPS_ORDER, CHECKOUT_STEPS, useCheckoutContext } from '@/features/checkout-process';
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
            <button
              key={step}
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
              {!isLast && <div className={style['step-bar__divider']} />}
            </button>
          )
        })
      }
    </nav>
  );
};
