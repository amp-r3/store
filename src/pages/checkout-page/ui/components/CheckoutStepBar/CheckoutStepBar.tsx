import { FC } from 'react';
import { StepType } from '@/features/checkout-process';
import {
  HiOutlineUser, HiUser,
  HiOutlineMapPin, HiMapPin,
  HiOutlineCreditCard, HiCreditCard
} from "react-icons/hi2";
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

          return (
            <button
              key={step}
              type="button"
              className={`${style['step-bar__tab']} ${isActive ? style['step-bar__tab--active'] : ''}`}
              disabled={!isClickable}
              onClick={() => setStep(step)}
            >
              {
                step === 'contacts' && (
                  <>
                    <span className={style['step-bar__num']}>01</span>
                    <span className={style['step-bar__label']}>Contacts</span>
                    <span className={style['step-bar__icon']}>
                      {step === 'contacts' ? <HiUser /> : <HiOutlineUser />}
                    </span>
                    <div className={style['step-bar__divider']} />
                  </>
                )
              }
              {
                step === 'delivery' && (
                  <>
                    <span className={style['step-bar__num']}>02</span>
                    <span className={style['step-bar__label']}>Delivery</span>
                    <span className={style['step-bar__icon']}>
                      {step === 'delivery' ? <HiMapPin /> : <HiOutlineMapPin />}
                    </span>
                    <div className={style['step-bar__divider']} />
                  </>
                )
              }
              {
                step === 'payment' && (
                  <>
                    <span className={style['step-bar__num']}>03</span>
                    <span className={style['step-bar__label']}>Payment</span>
                    <span className={style['step-bar__icon']}>
                      {step === 'payment' ? <HiCreditCard /> : <HiOutlineCreditCard />}
                    </span>

                  </>
                )
              }
            </button>
          )
        })
      }
    </nav>
  );
};