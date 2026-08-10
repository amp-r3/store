import { ReactNode, useId } from 'react';
import { HiCheck, HiLockClosed } from 'react-icons/hi';
import { STEPS_ORDER, StepType } from '../../model/types';
import { CHECKOUT_STEPS } from '../../model/checkoutConfig';
import { useCheckoutContext } from '../../model/CheckoutContext';
import { useStepRecap } from '../../lib';
import { CheckoutStepActions } from '../CheckoutStepActions/CheckoutStepActions';
import { useMediaQuery } from '@/shared/lib/hooks';
import style from './checkout-section.module.scss';

const MOBILE_QUERY = '(max-width: 860px)';

interface CheckoutSectionProps {
  step: StepType;
  children: ReactNode;
}

type SectionState = 'active' | 'completed' | 'locked';

export const CheckoutSection = ({ step, children }: CheckoutSectionProps) => {
  const { step: currentStep, maxReachedIndex, goToStep } = useCheckoutContext();
  const recap = useStepRecap(step);
  const bodyId = useId();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const ownIndex = STEPS_ORDER.indexOf(step);
  const isLast = ownIndex === STEPS_ORDER.length - 1;
  const config = CHECKOUT_STEPS[step];
  const isActive = step === currentStep;
  const state: SectionState = isActive
    ? 'active'
    : ownIndex > maxReachedIndex
      ? 'locked'
      : 'completed';

  const handleHeaderClick = () => {
    if (state === 'completed') goToStep(step);
  };

  return (
    <section className={style.section} data-state={state}>
      <div className={style.section__rail} aria-hidden="true">
        <span className={style.section__marker}>
          {state === 'completed' ? (
            <HiCheck />
          ) : state === 'locked' ? (
            <HiLockClosed />
          ) : (
            config.order
          )}
        </span>
        {!isLast && <span className={style.section__line} />}
      </div>

      <div className={style.section__main}>
        <h2 className={style.section__titleWrap}>
          <button
            type="button"
            className={style.section__header}
            onClick={handleHeaderClick}
            disabled={state === 'locked'}
            aria-expanded={isActive}
            aria-controls={bodyId}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className={style.section__headingText}>
              <span className={style.section__label}>{config.label}</span>
              {state === 'completed' && recap.length > 0 && (
                <span className={style.section__recap}>{recap.join(' · ')}</span>
              )}
            </span>
            {state === 'completed' && <span className={style.section__edit}>Edit</span>}
          </button>
        </h2>

        <div
          id={bodyId}
          className={`${style.section__body} ${isActive ? style['section__body--expanded'] : ''}`}
        >
          <div className={style.section__inner} inert={!isActive}>
            {children}
            {isActive && !isMobile && <CheckoutStepActions />}
          </div>
        </div>
      </div>
    </section>
  );
};
