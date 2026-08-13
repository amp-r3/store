import { describe, it, expect } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedDeliveryMethods, seedPaymentMethods } from '@test/seedApi';
import { makeDeliveryMethod, makePaymentMethod } from '@test/fixtures';
import { useCheckoutDelivery } from './useCheckoutDelivery';

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const render = async (
  deliveryMethods: ReturnType<typeof makeDeliveryMethod>[],
  paymentMethods: ReturnType<typeof makePaymentMethod>[],
  deliveryCode?: Parameters<typeof useCheckoutDelivery>[0],
  paymentCode?: Parameters<typeof useCheckoutDelivery>[1],
) => {
  const store = createTestStore();
  await seedDeliveryMethods(store, deliveryMethods);
  await seedPaymentMethods(store, paymentMethods);
  return renderHook(() => useCheckoutDelivery(deliveryCode, paymentCode), {
    wrapper: wrapperFor(store),
  });
};

describe('useCheckoutDelivery', () => {
  it('resolves the selected delivery and payment method by code', async () => {
    const standard = makeDeliveryMethod({ code: 'standard' });
    const express = makeDeliveryMethod({ code: 'express' });
    const cod = makePaymentMethod({ code: 'cash_on_delivery' });
    const { result } = await render([standard, express], [cod], 'express', 'cash_on_delivery');

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedDelivery).toEqual(express);
    expect(result.current.selectedPayment).toEqual(cod);
  });

  it('leaves the selection undefined when no code is given or none matches', async () => {
    const standard = makeDeliveryMethod({ code: 'standard' });
    const { result } = await render([standard], [], undefined, undefined);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedDelivery).toBeUndefined();
    expect(result.current.selectedPayment).toBeUndefined();
  });

  it('derives freeShippingThreshold from the fetched delivery methods', async () => {
    const method = makeDeliveryMethod({ code: 'standard', freeFromPrice: 150 });
    const { result } = await render([method], [], 'standard');

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.freeShippingThreshold).toBe(150);
  });

  it('isShippingRequired is false only for the pickup delivery code', async () => {
    const pickup = await render([], [], 'pickup');
    expect(pickup.result.current.isShippingRequired).toBe(false);

    const standard = await render([], [], 'standard');
    expect(standard.result.current.isShippingRequired).toBe(true);

    const none = await render([], [], undefined);
    expect(none.result.current.isShippingRequired).toBe(true);
  });
});
