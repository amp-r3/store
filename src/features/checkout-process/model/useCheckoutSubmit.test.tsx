import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { makeCheckoutDraft } from '@test/fixtures';
import { supabase } from '@/shared/api/supabase/client';
import { showToast } from '@/shared/ui';
import { CartProduct } from '@/entities/cart';
import { CheckoutFormValues } from './checkoutMasterSchema';
import { useCheckoutSubmit } from './useCheckoutSubmit';

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

vi.mock('@/shared/ui/toast/showToast', () => ({ showToast: vi.fn() }));

// Stable references — see LoginForm.test.tsx's header comment: a mock
// returning a fresh object per call would recreate submitOrder's
// useCallback dependency every render.
const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

const supabaseStub = supabase as unknown as SupabaseStub;
const mockedShowToast = vi.mocked(showToast);

const CHECKOUT_ITEMS: CartProduct[] = [{ sizeId: 1, productId: 10, quantity: 2 }];
const FORM_DATA = makeCheckoutDraft() as CheckoutFormValues;

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const renderSubmit = (isShippingRequired = true) => {
  const store = createTestStore();
  const setError = vi.fn();
  const rendered = renderHook(
    () => useCheckoutSubmit({ checkoutItems: CHECKOUT_ITEMS, isShippingRequired, setError }),
    { wrapper: wrapperFor(store) },
  );
  return { ...rendered, setError };
};

beforeEach(() => {
  supabaseStub.__reset();
  mockedShowToast.mockClear();
  Object.values(router).forEach((fn) => fn.mockClear());
});

describe('useCheckoutSubmit', () => {
  it('creates the order, clears the server cart, and redirects to the success page', async () => {
    supabaseStub.__setRpc('create_order', { data: { id: 'ord-uuid', order_number: 'ORD-123' } });
    supabaseStub.__setTable('cart_items', { data: null, error: null });

    const { result, setError } = renderSubmit();

    await act(async () => {
      await result.current.submitOrder(FORM_DATA);
    });

    expect(router.replace).toHaveBeenCalledWith('/checkout/success?order=ORD-123');
    expect(mockedShowToast).toHaveBeenCalledWith('success', 'Order placed');
    expect(setError).not.toHaveBeenCalled();

    const rpcCall = supabaseStub.__getCalls('rpc:create_order')[0];
    expect(rpcCall.args[0]).toMatchObject({
      p_items: [{ product_id: 10, size_id: 1, quantity: 2 }],
    });
  });

  it('still treats the order as successful when the post-order cart clear fails', async () => {
    supabaseStub.__setRpc('create_order', { data: { id: 'ord-uuid', order_number: 'ORD-9' } });
    supabaseStub.__setTable('cart_items', { error: { code: 'X', message: 'boom' } });

    const { result, setError } = renderSubmit();

    await act(async () => {
      await result.current.submitOrder(FORM_DATA);
    });

    expect(router.replace).toHaveBeenCalledWith('/checkout/success?order=ORD-9');
    expect(setError).not.toHaveBeenCalled();
  });

  it('sets a root form error and does not navigate when order creation fails', async () => {
    supabaseStub.__setRpc('create_order', { data: null, error: { message: 'Stock unavailable' } });

    const { result, setError } = renderSubmit();

    await act(async () => {
      await result.current.submitOrder(FORM_DATA);
    });

    expect(setError).toHaveBeenCalledWith('root', {
      type: 'server',
      message: 'Stock unavailable',
    });
    expect(router.replace).not.toHaveBeenCalled();
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('sends the literal "N/A" address fields for a pickup (non-shipping) order', async () => {
    supabaseStub.__setRpc('create_order', { data: { id: 'ord-uuid', order_number: 'ORD-1' } });
    supabaseStub.__setTable('cart_items', { data: null, error: null });

    const { result } = renderSubmit(false);

    await act(async () => {
      await result.current.submitOrder(FORM_DATA);
    });

    const rpcCall = supabaseStub.__getCalls('rpc:create_order')[0];
    expect(rpcCall.args[0]).toMatchObject({
      p_shipping_address: expect.objectContaining({ city: 'N/A', street: 'N/A' }),
    });
  });
});
