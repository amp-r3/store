import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { rehydrateAll } from '@test/guardHarness';
import { AdminRoute } from './AdminRoute';

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
  usePathname: () => '/admin/products',
  useSearchParams: () => new URLSearchParams(),
}));

const adminUser = {
  id: 'admin-id',
  firstName: 'Ada',
  lastName: 'Min',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin' as const,
  accessToken: 'admin-token',
};

const shopperUser = {
  id: 'shopper-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  role: 'user' as const,
  accessToken: 'shopper-token',
};

beforeEach(() => {
  router.replace.mockClear();
});

describe('AdminRoute — before rehydration resolves', () => {
  it('renders the fallback, without redirecting, while persist state is still unknown', () => {
    const store = createTestStore();
    renderWithProviders(
      <AdminRoute fallback={<div>Loading…</div>}>
        <div>Admin dashboard</div>
      </AdminRoute>,
      { store },
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe('AdminRoute — after rehydration resolves', () => {
  it('redirects an unauthenticated visitor to /login with a ?from= round-trip', async () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <AdminRoute>
        <div>Admin dashboard</div>
      </AdminRoute>,
      { store },
    );

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/login?from=%2Fadmin%2Fproducts'),
    );
  });

  it('holds on the fallback (does not redirect) while role is still unresolved for an authenticated user', () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <AdminRoute fallback={<div>Loading…</div>}>
        <div>Admin dashboard</div>
      </AdminRoute>,
      // role is only set via useSessionSync in the real app — a bare
      // setSession(authUser) leaves auth.user.role null until that resolves.
      { store, authUser: { ...shopperUser, role: null } },
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('redirects a resolved non-admin to / (not /login, to avoid a PublicRoute bounce loop)', async () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <AdminRoute>
        <div>Admin dashboard</div>
      </AdminRoute>,
      { store, authUser: shopperUser },
    );

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('Admin dashboard')).not.toBeInTheDocument();
  });

  it('renders children for a resolved admin', () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <AdminRoute>
        <div>Admin dashboard</div>
      </AdminRoute>,
      { store, authUser: adminUser },
    );

    expect(screen.getByText('Admin dashboard')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
