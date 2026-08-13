import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedCart } from '@test/seedApi';
import { supabase } from '@/shared/api/supabase/client';
import { setSession } from '@/entities/session';
import { restoreCart, CartData } from '@/entities/cart';
import { showToast } from '@/shared/ui';
import { useCartActions } from './useCartActions';

// A .tsx file (jsdom/component project, not node) — createTestStore pulls in
// @/app/store, whose side-effect imports need vitest.setup.ts's
// @/shared/api/revalidate mock (component-project-only, see AGENTS.md).

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

// Deep-mocks the concrete module rather than the @/shared/ui barrel — the
// barrel re-exports it, so the mock is visible through `import { showToast }
// from '@/shared/ui'` too, without pulling every other UI component into
// this file's module graph. A vi.mock() string target isn't a static
// `import`, so FSD's no-restricted-imports rule doesn't apply to it.
vi.mock('@/shared/ui/toast/showToast', () => ({ showToast: vi.fn() }));

const supabaseStub = supabase as unknown as SupabaseStub;
const mockedShowToast = vi.mocked(showToast);

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

const renderGuest = (
  cartItems: Record<number, CartData> = {},
  options?: Parameters<typeof useCartActions>[0],
) => {
  const store = createTestStore();
  store.dispatch(restoreCart(cartItems));
  const rendered = renderHook(() => useCartActions(options), { wrapper: wrapperFor(store) });
  return { store, ...rendered };
};

const renderAuthed = async (
  serverCart: Record<number, CartData> = {},
  options?: Parameters<typeof useCartActions>[0],
) => {
  const store = createTestStore();
  store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
  await seedCart(store, serverCart);
  const rendered = renderHook(() => useCartActions(options), { wrapper: wrapperFor(store) });
  return { store, ...rendered };
};

beforeEach(() => {
  supabaseStub.__reset();
  mockedShowToast.mockClear();
});

describe('useCartActions — guest (Redux) path', () => {
  it('onIncrease dispatches changeQuantity inc', () => {
    const { store, result } = renderGuest({ 1: { productId: 10, quantity: 1 } });

    act(() => {
      result.current.onIncrease(1, 10);
    });

    expect(store.getState().cart.items[1]).toEqual({ productId: 10, quantity: 2 });
  });

  it('onDecrease dispatches changeQuantity dec', () => {
    const { store, result } = renderGuest({ 1: { productId: 10, quantity: 2 } });

    act(() => {
      result.current.onDecrease(1, 10);
    });

    expect(store.getState().cart.items[1]).toEqual({ productId: 10, quantity: 1 });
  });

  it('onRemove dispatches removeFromCart', () => {
    const { store, result } = renderGuest({ 1: { productId: 10, quantity: 2 } });

    act(() => {
      result.current.onRemove(1, 10, 2);
    });

    expect(store.getState().cart.items[1]).toBeUndefined();
  });

  it('onClearCart dispatches clearCart', () => {
    const { store, result } = renderGuest({
      1: { productId: 10, quantity: 2 },
      2: { productId: 20, quantity: 1 },
    });

    act(() => {
      result.current.onClearCart();
    });

    expect(store.getState().cart.items).toEqual({});
  });
});

describe('useCartActions — toast rules', () => {
  it('raises "Added to cart" only on the 0 -> 1 transition, not on later increments', () => {
    const { result } = renderGuest({ 1: { productId: 10, quantity: 0 } });

    act(() => {
      result.current.onIncrease(1, 10, 50);
    });
    expect(mockedShowToast).toHaveBeenCalledWith(
      'added',
      'Added to cart',
      expect.objectContaining({ key: 'cart' }),
    );

    mockedShowToast.mockClear();
    act(() => {
      result.current.onIncrease(1, 10, 50);
    });
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('swaps the toast copy for a low-stock add (stock <= 10)', () => {
    const { result } = renderGuest({});

    act(() => {
      result.current.onIncrease(1, 10, 5);
    });

    expect(mockedShowToast).toHaveBeenCalledWith(
      'warning',
      'Only 5 left in stock',
      expect.objectContaining({ key: 'cart' }),
    );
  });

  it("does not raise a toast for a decrease that is not the line's last unit", () => {
    const { result } = renderGuest({ 1: { productId: 10, quantity: 3 } });

    act(() => {
      result.current.onDecrease(1, 10);
    });

    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('raises a removal toast with an Undo action once the last unit leaves', () => {
    const { result } = renderGuest({ 1: { productId: 10, quantity: 1 } });

    act(() => {
      result.current.onDecrease(1, 10);
    });

    expect(mockedShowToast).toHaveBeenCalledWith(
      'removed',
      'Removed from cart',
      expect.objectContaining({ key: 'cart', action: expect.objectContaining({ label: 'Undo' }) }),
    );
  });

  it('suppresses the removal toast and calls onRemoved instead, when supplied', () => {
    const onRemoved = vi.fn();
    const { result } = renderGuest({ 1: { productId: 10, quantity: 1 } }, { onRemoved });

    act(() => {
      result.current.onDecrease(1, 10);
    });

    expect(onRemoved).toHaveBeenCalledWith(1, 10, 1);
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('onClearCart snapshots before clearing and offers Undo when the cart had items', () => {
    const { result } = renderGuest({ 1: { productId: 10, quantity: 2 } });

    act(() => {
      result.current.onClearCart();
    });

    expect(mockedShowToast).toHaveBeenCalledWith(
      'removed',
      'Cart cleared',
      expect.objectContaining({
        showTimer: true,
        action: expect.objectContaining({ label: 'Undo' }),
      }),
    );
  });

  it('onClearCart on an already-empty cart skips the Undo affordance', () => {
    const { result } = renderGuest({});

    act(() => {
      result.current.onClearCart();
    });

    expect(mockedShowToast).toHaveBeenCalledWith(
      'removed',
      'Cart cleared',
      expect.objectContaining({ showTimer: false, action: undefined }),
    );
  });

  it('suppresses the clear toast and calls onCleared instead, when supplied and the cart had items', () => {
    const onCleared = vi.fn();
    const { result } = renderGuest({ 1: { productId: 10, quantity: 2 } }, { onCleared });

    act(() => {
      result.current.onClearCart();
    });

    expect(onCleared).toHaveBeenCalledWith({ 1: { productId: 10, quantity: 2 } });
    expect(mockedShowToast).not.toHaveBeenCalled();
  });
});

describe('useCartActions — authenticated (server) path', () => {
  it('onIncrease fires the upsertCartItem mutation rather than a Redux dispatch', async () => {
    const { store, result } = await renderAuthed({ 1: { productId: 10, quantity: 1 } });

    act(() => {
      result.current.onIncrease(1, 10);
    });

    await waitFor(() => {
      expect(supabaseStub.__getCalls('cart_items').length).toBeGreaterThan(0);
    });
    // The guest reducer must never run for an authenticated actor.
    expect(store.getState().cart.items).toEqual({});
  });

  it('still raises the same 0 -> 1 "Added to cart" toast on the authed path', async () => {
    const { result } = await renderAuthed({});

    act(() => {
      result.current.onIncrease(1, 10, 50);
    });

    expect(mockedShowToast).toHaveBeenCalledWith(
      'added',
      'Added to cart',
      expect.objectContaining({ key: 'cart' }),
    );
  });
});
