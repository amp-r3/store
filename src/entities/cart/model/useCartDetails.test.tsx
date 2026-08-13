import { describe, it, expect } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedProductArray, seedDeliveryMethods, seedCart } from '@test/seedApi';
import { makeProduct, makeDeliveryMethod } from '@test/fixtures';
import { restoreCart, CartData } from '@/entities/cart';
import { setSession } from '@/entities/session';
import { useCartDetails } from './useCartDetails';

// useCartDetails fans out to three RTK Query hooks (getCart, gated on auth;
// getDeliveryMethods; getProductArrayById, gated on isOpen). Every case here
// seeds the RTK Query cache directly rather than mocking the Supabase
// client, so no real queryFn ever fires and isLoading settles synchronously.

const AUTH_USER = {
  id: 'test-user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'test@example.com',
  role: 'user' as const,
  accessToken: 'test-token',
};

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const renderGuest = async ({
  cartItems = {},
  products = [],
  deliveryMethods = [],
  isOpen = true,
}: {
  cartItems?: Record<number, CartData>;
  products?: ReturnType<typeof makeProduct>[];
  deliveryMethods?: ReturnType<typeof makeDeliveryMethod>[];
  isOpen?: boolean;
}) => {
  const store = createTestStore();
  store.dispatch(restoreCart(cartItems));
  await seedDeliveryMethods(store, deliveryMethods);
  const ids = Object.values(cartItems).map((item) => item.productId);
  if (ids.length > 0 && isOpen) {
    await seedProductArray(store, ids, products);
  }
  const rendered = renderHook(() => useCartDetails(isOpen), { wrapper: wrapperFor(store) });
  return { store, ...rendered };
};

const renderAuthed = async ({
  serverCart = {},
  products = [],
  deliveryMethods = [],
}: {
  serverCart?: Record<number, CartData>;
  products?: ReturnType<typeof makeProduct>[];
  deliveryMethods?: ReturnType<typeof makeDeliveryMethod>[];
}) => {
  const store = createTestStore();
  store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
  await seedCart(store, serverCart);
  await seedDeliveryMethods(store, deliveryMethods);
  const ids = Object.values(serverCart).map((item) => item.productId);
  if (ids.length > 0) {
    await seedProductArray(store, ids, products);
  }
  const rendered = renderHook(() => useCartDetails(), { wrapper: wrapperFor(store) });
  return { store, ...rendered };
};

describe('useCartDetails — guest (Redux) path', () => {
  it('is empty for an empty cart', async () => {
    const { result } = await renderGuest({});

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalQuantity).toBe(0);
    expect(result.current.cartDetails).toEqual([]);
  });

  it('joins local cart items with fetched product data and totals', async () => {
    const product = makeProduct({ id: 10, basePrice: 100, price: 80 });
    const { result } = await renderGuest({
      cartItems: { 1: { productId: 10, quantity: 2 } },
      products: [product],
      deliveryMethods: [makeDeliveryMethod({ freeFromPrice: 100 })],
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isEmpty).toBe(false);
    expect(result.current.totalQuantity).toBe(2);
    expect(result.current.cartDetails).toEqual([{ ...product, sizeId: 1, quantity: 2 }]);
    expect(result.current.totals.subtotal).toBe(200);
    expect(result.current.totals.total).toBe(160);
  });

  it('maps a cart line with no matching product to null instead of throwing', async () => {
    const { result } = await renderGuest({
      cartItems: { 1: { productId: 10, quantity: 1 } },
      products: [],
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cartDetails).toEqual([null]);
    // A null line contributes no price, so totals stay at zero rather than
    // throwing on a missing basePrice/price.
    expect(result.current.totals.subtotal).toBe(0);
  });

  it('skips fetching product details while isOpen is false', async () => {
    const { result } = await renderGuest({
      cartItems: { 1: { productId: 10, quantity: 1 } },
      products: [makeProduct({ id: 10 })],
      isOpen: false,
    });

    expect(result.current.cartDetails).toEqual([null]);
    expect(result.current.isFetching).toBe(false);
  });
});

describe('useCartDetails — authenticated (server) path', () => {
  it('sources cart items from the server cart, not the local Redux slice', async () => {
    const product = makeProduct({ id: 20, basePrice: 50, price: 50 });
    const { result } = await renderAuthed({
      serverCart: { 3: { productId: 20, quantity: 4 } },
      products: [product],
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cartItems).toEqual([{ sizeId: 3, productId: 20, quantity: 4 }]);
    expect(result.current.totalQuantity).toBe(4);
  });
});
