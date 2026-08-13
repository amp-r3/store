import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { rehydrateAll } from '@test/guardHarness';
import { addToCheckout } from '@/features/checkout-process';
import { CheckoutGuard } from './CheckoutGuard';

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}));

let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/checkout',
  useSearchParams: () => searchParams,
}));

const AUTH_USER = {
  id: 'test-user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'test@example.com',
  role: 'user' as const,
  accessToken: 'test-token',
};

beforeEach(() => {
  router.replace.mockClear();
  searchParams = new URLSearchParams();
});

describe('CheckoutGuard — before rehydration resolves', () => {
  it('renders nothing while persist state is still unknown', () => {
    const store = createTestStore();
    renderWithProviders(
      <CheckoutGuard>
        <div>Checkout steps</div>
      </CheckoutGuard>,
      { store },
    );

    expect(screen.queryByText('Checkout steps')).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe('CheckoutGuard — after rehydration resolves', () => {
  it('redirects an unauthenticated visitor to /login with a ?from= round-trip (including the query string)', async () => {
    searchParams = new URLSearchParams('step=delivery');
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <CheckoutGuard>
        <div>Checkout steps</div>
      </CheckoutGuard>,
      { store },
    );

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/login?from=%2Fcheckout%3Fstep%3Ddelivery'),
    );
  });

  it('bounces an authenticated visitor with an empty cart and no ?order= back to /catalog', async () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <CheckoutGuard>
        <div>Checkout steps</div>
      </CheckoutGuard>,
      { store, authUser: AUTH_USER },
    );

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/catalog'));
    expect(screen.queryByText('Checkout steps')).not.toBeInTheDocument();
  });

  it('renders children for an authenticated visitor with checkout items', () => {
    const store = createTestStore();
    rehydrateAll(store);
    store.dispatch(addToCheckout([{ sizeId: 1, productId: 10, quantity: 1 }]));
    renderWithProviders(
      <CheckoutGuard>
        <div>Checkout steps</div>
      </CheckoutGuard>,
      { store, authUser: AUTH_USER },
    );

    expect(screen.getByText('Checkout steps')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('renders children for an authenticated visitor with an empty cart but a ?order= (post-purchase success page)', () => {
    searchParams = new URLSearchParams('order=ORD-123');
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <CheckoutGuard>
        <div>Order success</div>
      </CheckoutGuard>,
      { store, authUser: AUTH_USER },
    );

    expect(screen.getByText('Order success')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
