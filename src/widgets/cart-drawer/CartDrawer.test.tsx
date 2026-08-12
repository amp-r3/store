import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test/renderWithProviders';
import type { SupabaseStub } from '@test/supabaseStub';
import { makeProduct } from '@test/fixtures';
import { supabase } from '@/shared/api/supabase/client';
import { CartDrawer } from './CartDrawer';

// useTransitionRouter -> next/navigation's useRouter throws
// "invariant expected app router to be mounted" without an AppRouterContext
// ancestor, which jsdom never provides.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// A dynamic import inside the factory (rather than a top-level const
// referenced by the factory) sidesteps vi.mock's hoisting-above-imports
// semantics — a top-level binding would still be in its TDZ when the
// hoisted factory runs. Test bodies reconfigure the same stub instance via
// the `supabase` import above, which resolves to this factory's return
// value once the module is mocked.
vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const rawDeliveryMethod = {
  id: 'delivery-1',
  code: 'standard',
  name: 'Standard',
  price: 5,
  estimated_time: '3-5 business days',
  free_from_price: 100,
  is_active: true,
};

describe('CartDrawer', () => {
  it('renders one row per guest cart item', async () => {
    const productOne = makeProduct({ id: 101, title: 'Product One' });
    const productTwo = makeProduct({ id: 102, title: 'Product Two' });
    supabaseStub.__setTable('products_view', { data: [productOne, productTwo] });
    supabaseStub.__setTable('delivery_methods', { data: [rawDeliveryMethod] });

    renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} />, {
      cartItems: {
        1: { productId: 101, quantity: 2 },
        2: { productId: 102, quantity: 1 },
      },
    });

    expect(
      await screen.findByRole('link', { name: 'View details for Product One' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View details for Product Two' })).toBeInTheDocument();
  });

  it('shows the empty-cart state when the guest cart has no items', async () => {
    supabaseStub.__setTable('delivery_methods', { data: [rawDeliveryMethod] });

    renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
  });

  it('shows an error state with a retry action when the cart is empty and a fetch fails', async () => {
    // The blanket ErrorView only renders for `isEmpty && isError`
    // (CartDrawer.tsx) — a guest cart with items whose product lookup
    // fails instead renders a per-row "unavailable" banner (see the next
    // test). With zero cart items the product fetch is skipped entirely
    // (skip: ids.length === 0), so the delivery-methods fetch — which has
    // no such skip — is what has to fail to exercise this branch.
    supabaseStub.__setTable('delivery_methods', {
      error: { code: 'PGRST000', message: 'boom' },
    });

    renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} />);

    expect(
      await screen.findByText("We couldn't load your cart. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('flags a cart item whose product no longer exists and lets the user remove it', async () => {
    const productOne = makeProduct({ id: 101, title: 'Product One' });
    supabaseStub.__setTable('products_view', { data: [productOne] });
    supabaseStub.__setTable('delivery_methods', { data: [rawDeliveryMethod] });

    const { store, user } = renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} />, {
      cartItems: {
        1: { productId: 101, quantity: 1 },
        2: { productId: 102, quantity: 1 },
      },
    });

    expect(await screen.findByText('This product is no longer available.')).toBeInTheDocument();
    const removeButton = screen.getByRole('button', { name: 'Remove unavailable item' });

    await user.click(removeButton);

    expect(store.getState().cart.items[2]).toBeUndefined();
  });
});
