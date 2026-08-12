import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@test/renderWithProviders';
import type { SupabaseStub } from '@test/supabaseStub';
import { supabase } from '@/shared/api/supabase/client';
import { ChangePasswordForm } from './ChangePasswordForm';

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

// Satisfies every sync PASSWORD_RULES check (length, ASCII-only, a digit, an
// uppercase letter) and is high-entropy enough to clear zxcvbn's minimum
// strength score.
const STRONG_PASSWORD = 'Zq7#Wmt4Xrpl9K';

interface FillAndSubmitOptions {
  current?: string;
  next?: string;
  confirm?: string;
}

const fillAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  { current = 'oldpassword', next = STRONG_PASSWORD, confirm = next }: FillAndSubmitOptions = {},
) => {
  await user.type(screen.getByLabelText('Current password'), current);
  await user.type(screen.getByLabelText('New password'), next);
  await user.type(screen.getByLabelText('Repeat new password'), confirm);
  await user.click(screen.getByRole('button', { name: 'Update password' }));
};

describe('ChangePasswordForm', () => {
  it('flags a mismatched confirmation under Repeat new password', async () => {
    const { user } = renderWithProviders(
      <ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );

    await fillAndSubmit(user, { confirm: 'SomethingElse123' });

    const confirmInput = screen.getByLabelText('Repeat new password');
    await waitFor(() =>
      expect(confirmInput).toHaveAccessibleDescription("The passwords don't match"),
    );
  });

  it('rejects reusing the current password as the new one, blocking submission', async () => {
    const { user } = renderWithProviders(
      <ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );

    await fillAndSubmit(user, { current: STRONG_PASSWORD, next: STRONG_PASSWORD });

    // This constraint is a Zod-level error, not a server one — ChangePasswordForm
    // always passes New password's `error` as a boolean (`error={!!errors.password}`,
    // the same boolean/string convention FormField.test.tsx covers), so it
    // surfaces only as aria-invalid, with no rendered message text. Submission
    // being blocked (the mutation's first call, re-auth, never firing) is the
    // user-visible proof the validation actually ran.
    const newPasswordInput = screen.getByLabelText('New password');
    await waitFor(() => expect(newPasswordInput).toHaveAttribute('aria-invalid', 'true'));
    expect(supabaseStub.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('routes a 401 (wrong current password) onto the Current password field', async () => {
    supabaseStub.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const { user } = renderWithProviders(
      <ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );

    await fillAndSubmit(user);

    const currentPasswordInput = screen.getByLabelText('Current password');
    await waitFor(() =>
      expect(currentPasswordInput).toHaveAccessibleDescription('Current password is incorrect'),
    );
  });

  it('routes any other server failure onto the root alert', async () => {
    supabaseStub.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    supabaseStub.auth.updateUser.mockResolvedValue({
      data: null,
      error: { status: 400, message: 'Weak password rejected by server' },
    });

    const { user } = renderWithProviders(
      <ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Weak password rejected by server');
  });

  it('marks Update password busy and disables (but does not busy) Back while pending', async () => {
    let resolveUpdate: (value: { data: unknown; error: unknown }) => void = () => {};
    supabaseStub.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    supabaseStub.auth.updateUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    const { user } = renderWithProviders(
      <ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );

    await user.type(screen.getByLabelText('Current password'), 'oldpassword');
    await user.type(screen.getByLabelText('New password'), STRONG_PASSWORD);
    await user.type(screen.getByLabelText('Repeat new password'), STRONG_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    const submitButton = await screen.findByRole('button', { name: 'Update password' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeDisabled();
    expect(backButton).not.toHaveAttribute('aria-busy');

    resolveUpdate({ data: null, error: null });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it('calls onCancel when Back is clicked at rest', async () => {
    const onCancel = vi.fn();
    const { user } = renderWithProviders(
      <ChangePasswordForm onSuccess={vi.fn()} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
