import { describe, it, expect, vi } from 'vitest';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { makeDeliveryMethod, makePaymentMethod } from '@test/fixtures';
import { CheckoutFormValues } from '../model/checkoutMasterSchema';
import { useStepRecap } from './useStepRecap';

// buildStepRecap.test.ts already covers every branch of the recap copy
// itself — this test only checks the wiring: that useStepRecap reads live
// form values via useWatch and forwards the checkout context through
// unchanged, so mock useCheckoutContext directly rather than mounting the
// full CheckoutProvider (which would need a store, RTK Query cache, and
// seeded delivery/payment data just to reach this hook).
const mockContext = vi.hoisted(() => ({
  selectedDelivery: undefined as ReturnType<typeof makeDeliveryMethod> | undefined,
  selectedPayment: undefined as ReturnType<typeof makePaymentMethod> | undefined,
  isShippingRequired: true,
}));

vi.mock('../model/CheckoutContext', () => ({
  useCheckoutContext: () => mockContext,
}));

const wrapperFor = (defaultValues: Partial<CheckoutFormValues>) => {
  function Wrapper({ children }: { children: ReactNode }) {
    const methods = useForm<CheckoutFormValues>({ defaultValues });
    return <FormProvider {...methods}>{children}</FormProvider>;
  }
  return Wrapper;
};

describe('useStepRecap', () => {
  it('reads live contacts field values from the form for the contacts step', () => {
    const { result } = renderHook(() => useStepRecap('contacts'), {
      wrapper: wrapperFor({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }),
    });

    expect(result.current).toEqual(['Jane Doe', 'jane@example.com']);
  });

  it('combines the form address with the context-selected delivery method', () => {
    mockContext.selectedDelivery = makeDeliveryMethod({ label: 'Express', duration: '1-2d' });
    mockContext.isShippingRequired = true;

    const { result } = renderHook(() => useStepRecap('delivery'), {
      wrapper: wrapperFor({ street: 'Main St', housenumber: '1', city: 'NYC', postcode: '10001' }),
    });

    expect(result.current).toEqual(['Express · 1-2d', 'Main St 1, NYC, 10001']);
  });

  it('omits the address when isShippingRequired is false, from the context', () => {
    mockContext.selectedDelivery = makeDeliveryMethod({ label: 'Pickup', duration: undefined });
    mockContext.isShippingRequired = false;

    const { result } = renderHook(() => useStepRecap('delivery'), {
      wrapper: wrapperFor({ street: 'Main St', city: 'NYC' }),
    });

    expect(result.current).toEqual(['Pickup']);
  });

  it('reads the selected payment method from context for the payment step', () => {
    mockContext.selectedPayment = makePaymentMethod({ code: 'cash_on_delivery' });

    const { result } = renderHook(() => useStepRecap('payment'), {
      wrapper: wrapperFor({}),
    });

    expect(result.current).toEqual(['Upon delivery']);
  });
});
