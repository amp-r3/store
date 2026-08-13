import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { rehydrateAll } from '@test/guardHarness';
import { ProtectedRoute } from './ProtectedRoute';

// Stable references — see LoginForm.test.tsx's header comment.
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
  usePathname: () => '/user/orders',
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
});

describe('ProtectedRoute — before rehydration resolves', () => {
  it('renders the fallback, without redirecting, while persist state is still unknown', () => {
    const store = createTestStore();
    renderWithProviders(
      <ProtectedRoute fallback={<div>Loading…</div>}>
        <div>Protected content</div>
      </ProtectedRoute>,
      { store },
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe('ProtectedRoute — after rehydration resolves', () => {
  it('redirects an unauthenticated visitor to /login with a ?from= round-trip, rendering nothing', async () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      { store },
    );

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/login?from=%2Fuser%2Forders'),
    );
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children for an authenticated visitor, without redirecting', () => {
    const store = createTestStore();
    rehydrateAll(store);
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      { store, authUser: AUTH_USER },
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
