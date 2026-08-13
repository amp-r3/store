import { describe, it, expect } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedProductArray } from '@test/seedApi';
import { makeProduct } from '@test/fixtures';
import { addToCheckout } from './checkoutSlice';
import { useCheckoutDetails } from './useCheckoutDetails';

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

describe('useCheckoutDetails', () => {
  it('is empty for an empty checkout', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCheckoutDetails(null), { wrapper: wrapperFor(store) });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.checkoutDetails).toEqual([]);
  });

  it('joins checkout items with fetched product data and computes totals', async () => {
    const store = createTestStore();
    store.dispatch(addToCheckout([{ sizeId: 1, productId: 10, quantity: 2 }]));
    const product = makeProduct({ id: 10, basePrice: 50, price: 40 });
    await seedProductArray(store, [10], [product]);

    const { result } = renderHook(() => useCheckoutDetails(null), { wrapper: wrapperFor(store) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.checkoutDetails).toEqual([{ ...product, sizeId: 1, quantity: 2 }]);
    expect(result.current.totals.subtotal).toBe(100);
    expect(result.current.totals.total).toBe(80);
  });

  it('nulls a checkout line whose product no longer resolves, rather than dropping it', async () => {
    const store = createTestStore();
    store.dispatch(addToCheckout([{ sizeId: 1, productId: 10, quantity: 1 }]));
    await seedProductArray(store, [10], []);

    const { result } = renderHook(() => useCheckoutDetails(null), { wrapper: wrapperFor(store) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.checkoutDetails).toEqual([null]);
  });

  it('forwards freeShippingThreshold through to the computed totals', async () => {
    const store = createTestStore();
    store.dispatch(addToCheckout([{ sizeId: 1, productId: 10, quantity: 1 }]));
    const product = makeProduct({ id: 10, basePrice: 50, price: 50 });
    await seedProductArray(store, [10], [product]);

    const { result } = renderHook(() => useCheckoutDetails(50), { wrapper: wrapperFor(store) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.totals.shippingProgress).toBe(100);
  });
});
