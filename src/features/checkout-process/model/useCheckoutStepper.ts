import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { UseFormReturn } from 'react-hook-form';
import { useHaptics } from '@/shared/lib/hooks';
import { scrollToElement } from '@/shared/lib';
import { STEPS_ORDER, StepType } from './types';
import { CHECKOUT_STEPS } from './checkoutConfig';
import { CHECKOUT_STEP_SCHEMAS, CheckoutFormValues } from './checkoutMasterSchema';

const isStepType = (value: string | null): value is StepType =>
  !!value && (STEPS_ORDER as readonly string[]).includes(value);

// A step is "reached" once every earlier step's own data validates against the
// saved draft, so a reload with a complete draft keeps the whole trail unlocked.
const computeMaxReachedIndex = (draft: Partial<CheckoutFormValues> | null): number => {
  if (!draft) return 0;

  let maxIndex = 0;
  for (const step of STEPS_ORDER) {
    if (!CHECKOUT_STEP_SCHEMAS[step].safeParse(draft).success) break;
    maxIndex = Math.min(STEPS_ORDER.indexOf(step) + 1, STEPS_ORDER.length - 1);
  }
  return maxIndex;
};

export const useCheckoutStepper = (
  methods: UseFormReturn<CheckoutFormValues>,
  draft: Partial<CheckoutFormValues> | null
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxReachedIndex, setMaxReachedIndex] = useState(() => computeMaxReachedIndex(draft));
  const { soft } = useHaptics();

  const requestedStep = searchParams.get('step');
  const requestedIndex = isStepType(requestedStep) ? STEPS_ORDER.indexOf(requestedStep) : 0;
  const stepIndex = Math.min(requestedIndex, maxReachedIndex);
  const step = STEPS_ORDER[stepIndex];
  const isLastStep = stepIndex === STEPS_ORDER.length - 1;

  const setStep = useCallback((target: StepType, replace = false) => {
    setSearchParams((params) => {
      params.set('step', target);
      return params;
    }, { replace });
  }, [setSearchParams]);

  useEffect(() => {
    if (requestedStep !== step) {
      setStep(step, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateStep = useCallback(
    (target: StepType) => methods.trigger(CHECKOUT_STEPS[target].fields),
    [methods]
  );

  const goNext = useCallback(async () => {
    const isValid = await validateStep(step);

    if (!isValid) {
      const firstErrorField = CHECKOUT_STEPS[step].fields.find((field) => methods.formState.errors[field]);
      if (firstErrorField) methods.setFocus(firstErrorField);
      return;
    }

    const nextIndex = stepIndex + 1;
    setMaxReachedIndex((current) => Math.max(current, nextIndex));
    setStep(STEPS_ORDER[nextIndex]);
    soft();
    scrollToElement('checkout-form');
  }, [step, stepIndex, validateStep, methods, setStep, soft]);

  const goToStep = useCallback(async (target: StepType) => {
    const targetIndex = STEPS_ORDER.indexOf(target);

    if (targetIndex === stepIndex) return;

    if (targetIndex < stepIndex) {
      setStep(target);
      soft();
      scrollToElement('checkout-form');
      return;
    }

    if (targetIndex <= maxReachedIndex) {
      const isValid = await validateStep(step);
      if (isValid) {
        setStep(target);
        soft();
        scrollToElement('checkout-form');
      }
    }
  }, [stepIndex, maxReachedIndex, step, validateStep, setStep, soft]);

  return { step, stepIndex, isLastStep, maxReachedIndex, goNext, goToStep };
};
