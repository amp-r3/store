import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SupabaseStub } from '@test/supabaseStub';
import { renderWithProviders } from '@test/renderWithProviders';
import { supabase } from '@/shared/api/supabase/client';
import { SessionUser } from '@/entities/session';
import { UserProfileForm } from './UserProfileForm';

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const user: SessionUser = {
  id: 'test-user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'test@example.com',
  role: 'user',
  accessToken: 'token',
};

describe('UserProfileForm', () => {
  it('pre-fills every field from the user prop', () => {
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    expect(screen.getByLabelText('First name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Last name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Username')).toHaveValue('janedoe');
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
  });

  it('disables Email and explains why for a Google-linked account', () => {
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={true} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveAccessibleDescription(
      "Your email is linked to Google. You can't change it here.",
    );
  });

  it('does not show the Google-linked description for a non-Google account', () => {
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    expect(
      screen.queryByText("Your email is linked to Google. You can't change it here."),
    ).not.toBeInTheDocument();
  });

  it('routes a duplicate-username server error onto the Username field', async () => {
    supabaseStub.__setTable('profiles', {
      error: { message: 'duplicate key value violates unique constraint "profiles_username_key"' },
    });
    const testUser = userEvent.setup();
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    await testUser.clear(screen.getByLabelText('Username'));
    await testUser.type(screen.getByLabelText('Username'), 'takenname');
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    const usernameInput = screen.getByLabelText('Username');
    await waitFor(() =>
      expect(usernameInput).toHaveAccessibleDescription('This username is already taken'),
    );
  });

  it('routes a duplicate-email server error onto the Email field', async () => {
    supabaseStub.__setTable('profiles', { data: {}, error: null });
    supabaseStub.auth.updateUser.mockResolvedValue({
      data: null,
      error: { message: 'Email address is already registered' },
    });
    const testUser = userEvent.setup();
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    await testUser.clear(screen.getByLabelText('Email'));
    await testUser.type(screen.getByLabelText('Email'), 'new@example.com');
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    const emailInput = screen.getByLabelText('Email');
    await waitFor(() =>
      expect(emailInput).toHaveAccessibleDescription('This email is already registered'),
    );
  });

  it('routes any other server failure onto the root alert', async () => {
    supabaseStub.__setTable('profiles', {
      error: { message: 'Something unexpected happened' },
    });
    const testUser = userEvent.setup();
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    await testUser.clear(screen.getByLabelText('Username'));
    await testUser.type(screen.getByLabelText('Username'), 'newname');
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Something unexpected happened');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    const { user: interactionUser } = renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={onCancel} onSuccess={vi.fn()} />,
    );

    await interactionUser.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSuccess once the mutation succeeds', async () => {
    supabaseStub.__setTable('profiles', { data: {}, error: null });
    const onSuccess = vi.fn();
    const testUser = userEvent.setup();
    renderWithProviders(
      <UserProfileForm user={user} isGoogleUser={false} onCancel={vi.fn()} onSuccess={onSuccess} />,
    );

    await testUser.clear(screen.getByLabelText('Username'));
    await testUser.type(screen.getByLabelText('Username'), 'newname');
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
