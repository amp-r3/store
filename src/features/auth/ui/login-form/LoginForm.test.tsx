import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@test/renderWithProviders';
import type { SupabaseStub } from '@test/supabaseStub';
import { supabase } from '@/shared/api/supabase/client';
import { LoginForm } from './LoginForm';

// Stable references, not new objects per call — useTransitionRouter and
// useUrlState put the router/searchParams objects straight into
// useCallback/useEffect dependency arrays (see 0b7f8ee's fix for the same
// class of bug), so a mock returning a fresh object every render triggers
// an infinite re-render loop instead of a clean one-time mount.
vi.mock('next/navigation', () => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };
  const searchParams = new URLSearchParams();
  return {
    useRouter: () => router,
    usePathname: () => '/login',
    useSearchParams: () => searchParams,
  };
});

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const goToEmailStep = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Continue with Email' }));
};

describe('LoginForm', () => {
  it('shows field-level validation errors for an empty submission', async () => {
    const { user } = renderWithProviders(<LoginForm />);
    await goToEmailStep(user);

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    const emailInput = await screen.findByLabelText('Email');
    expect(emailInput).toHaveAccessibleDescription('Incorrect email');
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAccessibleDescription('Minimum 6 characters');
  });

  it('disables Log in (keeping its name) and Back while the mutation is pending', async () => {
    let resolveSignIn: (value: { data: unknown; error: unknown }) => void = () => {};
    supabaseStub.auth.signInWithPassword.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    const { user } = renderWithProviders(<LoginForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    const submitButton = await screen.findByRole('button', { name: 'Log in' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeDisabled();
    expect(backButton).not.toHaveAttribute('aria-busy');

    resolveSignIn({ data: null, error: { message: 'invalid' } });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it('shows a fixed message for a 401 (wrong credentials), never leaking which field was wrong', async () => {
    supabaseStub.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const { user } = renderWithProviders(<LoginForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('surfaces a non-auth server failure (e.g. profile lookup) via getErrorMessage', async () => {
    supabaseStub.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'user@example.com' },
        session: { access_token: 'token' },
      },
      error: null,
    });
    supabaseStub.__setTable('profiles', { error: { message: 'db down' } });

    const { user } = renderWithProviders(<LoginForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Error loading profile data');
  });
});
