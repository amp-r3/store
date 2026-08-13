import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { rehydrateAll } from '@test/guardHarness';
import { AUTH_STORAGE_KEYS } from '@/shared/config';
import { PublicRoute } from './PublicRoute';

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
  sessionStorage.clear();
});

describe('PublicRoute — before rehydration resolves', () => {
  it('renders nothing while persist state is still unknown', () => {
    const store = createTestStore();
    renderWithProviders(
      <PublicRoute>
        <div>Login form</div>
      </PublicRoute>,
      { store },
    );

    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe('PublicRoute — after rehydration resolves', () => {
  it('renders children for an unauthenticated visitor', () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <PublicRoute>
        <div>Login form</div>
      </PublicRoute>,
      { store },
    );

    expect(screen.getByText('Login form')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('redirects an authenticated visitor to the ?from= URL param target', async () => {
    searchParams = new URLSearchParams('from=%2Fuser%2Forders');
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <PublicRoute>
        <div>Login form</div>
      </PublicRoute>,
      { store, authUser: AUTH_USER },
    );

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/user/orders'));
  });

  it('prefers a sessionStorage-stashed redirect (post-OAuth) over the ?from= param, and clears it', async () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.redirectFrom, '/checkout');
    searchParams = new URLSearchParams('from=%2Fuser%2Forders');
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <PublicRoute>
        <div>Login form</div>
      </PublicRoute>,
      { store, authUser: AUTH_USER },
    );

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/checkout'));
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.redirectFrom)).toBeNull();
  });

  it('falls back to / when the ?from= target is an open-redirect attempt', async () => {
    searchParams = new URLSearchParams('from=https://evil.com');
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <PublicRoute>
        <div>Login form</div>
      </PublicRoute>,
      { store, authUser: AUTH_USER },
    );

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  });
});
