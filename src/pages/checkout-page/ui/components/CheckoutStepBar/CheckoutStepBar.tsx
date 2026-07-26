import { FC } from 'react';
import { StepType, CHECKOUT_STEPS } from '@/features/checkout-process';
import style from './checkout-step-bar.module.scss';

interface CheckoutStepBarProps {
  currentStep: StepType;
  highestStepIndex: number;
  stepsOrder: readonly StepType[];
  setStep(step: StepType): void;
}

export const CheckoutStepBar: FC<CheckoutStepBarProps> = ({ currentStep, stepsOrder, highestStepIndex, setStep }) => {
  return (
    <nav className={style['step-bar']}>
      {
        stepsOrder.map((step, index) => {
          const isClickable = index <= highestStepIndex;
          const isActive = step === currentStep;
          const config = CHECKOUT_STEPS[step];
          const isLast = index === stepsOrder.length - 1;

          return (
            <button
              key={step}
              type="button"
              className={`${style['step-bar__tab']} ${isActive ? style['step-bar__tab--active'] : ''}`}
              disabled={!isClickable}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => setStep(step)}
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