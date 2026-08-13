import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { supabase } from '@/shared/api/supabase/client';
import { setSession } from '@/entities/session';
import { AUTH_STORAGE_KEYS } from '@/shared/config';
import { useSessionSync } from './useSessionSync';

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const SESSION = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  access_token: 'test-token',
};

beforeEach(() => {
  supabaseStub.__reset();
  sessionStorage.clear();
});

describe('useSessionSync — sign-in', () => {
  it('flips isAuth immediately with blank profile fields, before the profile row resolves', async () => {
    supabaseStub.__setTable('profiles', {
      data: { first_name: 'Jane', last_name: 'Doe', username: 'janedoe', role: 'user' },
    });
    const store = createTestStore();
    renderHook(() => useSessionSync(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', SESSION);

    expect(store.getState().auth.user).toEqual(
      expect.objectContaining({ id: 'test-user-id', firstName: '', lastName: '', role: null }),
    );

    // Let the (unawaited) profile fetch settle so it can't leak a
    // post-test state update into a later test.
    await waitFor(() => expect(store.getState().auth.user?.role).toBe('user'));
  });

  it('fills in the profile fields and role once the profiles row resolves', async () => {
    supabaseStub.__setTable('profiles', {
      data: { first_name: 'Jane', last_name: 'Doe', username: 'janedoe', role: 'admin' },
    });
    const store = createTestStore();
    renderHook(() => useSessionSync(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', SESSION);

    await waitFor(() =>
      expect(store.getState().auth.user).toEqual(
        expect.objectContaining({ firstName: 'Jane', lastName: 'Doe', role: 'admin' }),
      ),
    );
  });

  it('falls back to role "user" (never leaves it stuck at null) when the profile fetch errors', async () => {
    supabaseStub.__setTable('profiles', { error: { code: 'PGRST000', message: 'boom' } });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = createTestStore();
    renderHook(() => useSessionSync(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', SESSION);

    await waitFor(() => expect(store.getState().auth.user?.role).toBe('user'));
    consoleError.mockRestore();
  });

  it('clears any stashed blocked-OAuth-providers list on a successful sign-in', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.blockedProviders, 'google');
    const store = createTestStore();
    renderHook(() => useSessionSync(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('SIGNED_IN', SESSION);

    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.blockedProviders)).toBeNull();
  });
});

describe('useSessionSync — no session', () => {
  it('logs out, clearing a stale persisted user, when the auth event carries no session', () => {
    const store = createTestStore();
    store.dispatch(
      setSession({
        user: {
          id: 'stale',
          firstName: 'Old',
          lastName: 'User',
          username: 'old',
          email: 'old@example.com',
          role: 'user',
          accessToken: 'stale-token',
        },
        token: 'stale-token',
      }),
    );
    renderHook(() => useSessionSync(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitAuthChange('INITIAL_SESSION', null);

    expect(store.getState().auth.user).toBeNull();
  });
});
