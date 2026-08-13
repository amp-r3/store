import { describe, it, expect } from 'vitest';
import { authSlice, setSession, setRole, logout, stripAccessToken, AuthState } from './authSlice';
import { SessionUser } from './types';

const reducer = authSlice.reducer;

const emptyState: AuthState = { user: null, token: null };

const baseUser: SessionUser = {
  id: 'user-1',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  role: 'user',
  accessToken: 'token-1',
};

describe('authSlice', () => {
  describe('setSession — same user (repeat dispatch)', () => {
    it('preserves existing firstName/lastName/username when the incoming values are empty strings', () => {
      const seeded: AuthState = { user: baseUser, token: 'token-1' };
      const state = reducer(
        seeded,
        setSession({
          user: { ...baseUser, firstName: '', lastName: '', username: '' },
          token: 'token-2',
        }),
      );

      expect(state.user).toEqual(
        expect.objectContaining({ firstName: 'Jane', lastName: 'Doe', username: 'janedoe' }),
      );
    });

    it('overwrites firstName/lastName/username once the incoming values are non-empty', () => {
      const seeded: AuthState = { user: baseUser, token: 'token-1' };
      const state = reducer(
        seeded,
        setSession({
          user: { ...baseUser, firstName: 'Janet', lastName: 'Smith', username: 'janets' },
          token: 'token-2',
        }),
      );

      expect(state.user).toEqual(
        expect.objectContaining({ firstName: 'Janet', lastName: 'Smith', username: 'janets' }),
      );
    });

    it('preserves the stored role when the incoming role is the null "not yet resolved" sentinel', () => {
      const seeded: AuthState = { user: { ...baseUser, role: 'admin' }, token: 'token-1' };
      const state = reducer(
        seeded,
        setSession({ user: { ...baseUser, role: null }, token: 'token-2' }),
      );

      expect(state.user?.role).toBe('admin');
    });

    it('applies a genuine role change (e.g. an admin -> user demotion) when the incoming role is non-null', () => {
      const seeded: AuthState = { user: { ...baseUser, role: 'admin' }, token: 'token-1' };
      const state = reducer(
        seeded,
        setSession({ user: { ...baseUser, role: 'user' }, token: 'token-2' }),
      );

      expect(state.user?.role).toBe('user');
    });

    it('always overwrites the token, since the token is not part of the merge', () => {
      const seeded: AuthState = { user: baseUser, token: 'token-1' };
      const state = reducer(seeded, setSession({ user: baseUser, token: 'token-2' }));

      expect(state.token).toBe('token-2');
    });
  });

  describe('setSession — different user', () => {
    it('replaces the user wholesale rather than merging fields', () => {
      const seeded: AuthState = { user: baseUser, token: 'token-1' };
      const otherUser: SessionUser = { ...baseUser, id: 'user-2', firstName: '', role: null };
      const state = reducer(seeded, setSession({ user: otherUser, token: 'token-2' }));

      expect(state.user).toEqual(otherUser);
    });
  });

  describe('logout', () => {
    it('clears the user and token', () => {
      const seeded: AuthState = { user: baseUser, token: 'token-1' };
      const state = reducer(seeded, logout());

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('setRole', () => {
    it('resolves the role on the current user in place', () => {
      const seeded: AuthState = { user: { ...baseUser, role: null }, token: 'token-1' };
      const state = reducer(seeded, setRole('admin'));

      expect(state.user?.role).toBe('admin');
    });

    it('is a no-op when there is no signed-in user', () => {
      const state = reducer(emptyState, setRole('admin'));
      expect(state.user).toBeNull();
    });
  });

  describe('stripAccessToken', () => {
    it('nulls the token and empties user.accessToken on the inbound (persist-write) transform', () => {
      const state: AuthState = { user: baseUser, token: 'live-token' };
      const persisted = stripAccessToken.in(state, 'auth', state);

      expect(persisted.token).toBeNull();
      expect(persisted.user?.accessToken).toBe('');
      // Every other field survives the strip.
      expect(persisted.user).toEqual(expect.objectContaining({ id: 'user-1', role: 'user' }));
    });

    it('is a no-op for a signed-out (null user) state', () => {
      const persisted = stripAccessToken.in(emptyState, 'auth', emptyState);
      expect(persisted.user).toBeNull();
      expect(persisted.token).toBeNull();
    });

    it('the outbound (rehydrate-read) transform is the identity — nothing to restore', () => {
      const state: AuthState = { user: baseUser, token: 'live-token' };
      expect(stripAccessToken.out(state, 'auth', state)).toBe(state);
    });
  });
});
