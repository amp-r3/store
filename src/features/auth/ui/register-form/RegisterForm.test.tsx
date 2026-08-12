import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@test/renderWithProviders';
import type { SupabaseStub } from '@test/supabaseStub';
import { supabase } from '@/shared/api/supabase/client';
import { RegisterForm } from './RegisterForm';

// Stable references, not new objects per call — see LoginForm.test.tsx: a
// fresh object per render loops indefinitely (useTransitionRouter/
// useUrlState put these straight into dependency arrays).
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
    usePathname: () => '/register',
    useSearchParams: () => searchParams,
  };
});

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

// Satisfies every sync PASSWORD_RULES check and is high-entropy enough to
// clear zxcvbn's minimum strength score (same constant LoginForm's sibling
// ChangePasswordForm.test.tsx uses).
const STRONG_PASSWORD = 'Zq7#Wmt4Xrpl9K';

const goToEmailStep = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Continue with Email' }));
};

describe('RegisterForm', () => {
  it('shows a visible email error and an invalid-only password on an empty submission', async () => {
    const { user } = renderWithProviders(<RegisterForm />);
    await goToEmailStep(user);

    await user.click(screen.getByRole('button', { name: 'Register' }));

    const emailInput = await screen.findByLabelText('Email');
    expect(emailInput).toHaveAccessibleDescription('Incorrect email');

    // Client-side password rule violations stay a bare boolean — see the
    // component's own comment — so FormField renders no dedicated error
    // message for it, only aria-invalid; PasswordRequirements (linked via
    // its own aria-describedby) is the visible surface for what's unmet.
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('flags a mismatched Repeat password with a visible message', async () => {
    const { user } = renderWithProviders(<RegisterForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), STRONG_PASSWORD);
    await user.type(screen.getByLabelText('Repeat password'), 'SomethingElse123!');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    const confirmInput = await screen.findByLabelText('Repeat password');
    expect(confirmInput).toHaveAccessibleDescription("The passwords don't match");
  });

  it('routes an "already registered" server error onto the Email field', async () => {
    supabaseStub.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    });

    const { user } = renderWithProviders(<RegisterForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), STRONG_PASSWORD);
    await user.type(screen.getByLabelText('Repeat password'), STRONG_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    const emailInput = screen.getByLabelText('Email');
    await waitFor(() =>
      expect(emailInput).toHaveAccessibleDescription('This email is already registered'),
    );
  });

  it('routes a server "password" error onto Password — as visible text, unlike the client-side case', async () => {
    supabaseStub.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Password does not meet server policy' },
    });

    const { user } = renderWithProviders(<RegisterForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), STRONG_PASSWORD);
    await user.type(screen.getByLabelText('Repeat password'), STRONG_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    // aria-describedby merges the error span with the linked
    // PasswordRequirements checklist, so the accessible description
    // contains — rather than equals — the server message.
    const passwordInput = screen.getByLabelText('Password');
    await waitFor(() =>
      expect(passwordInput).toHaveAccessibleDescription(/The password is too weak/),
    );
  });

  it('routes any other signUp failure onto the root alert', async () => {
    supabaseStub.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Network request failed' },
    });

    const { user } = renderWithProviders(<RegisterForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), STRONG_PASSWORD);
    await user.type(screen.getByLabelText('Repeat password'), STRONG_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Network request failed');
  });

  it('disables Register (keeping its name) and Back while the mutation is pending', async () => {
    let resolveSignUp: (value: { data: unknown; error: unknown }) => void = () => {};
    supabaseStub.auth.signUp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignUp = resolve;
        }),
    );

    const { user } = renderWithProviders(<RegisterForm />);
    await goToEmailStep(user);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), STRONG_PASSWORD);
    await user.type(screen.getByLabelText('Repeat password'), STRONG_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    const submitButton = await screen.findByRole('button', { name: 'Register' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeDisabled();
    expect(backButton).not.toHaveAttribute('aria-busy');

    resolveSignUp({ data: null, error: { message: 'network error' } });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });
});
