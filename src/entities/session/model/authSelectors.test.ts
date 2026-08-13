import { describe, it, expect } from 'vitest';
import {
  selectUser,
  selectToken,
  selectIsAuth,
  selectUserRole,
  selectIsAdmin,
  selectUserName,
} from './authSelectors';
import { AuthState } from './authSlice';
import { SessionUser } from './types';

const user: SessionUser = {
  id: 'user-1',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  role: 'user',
  accessToken: 'token-1',
};

const stateWith = (auth: AuthState) => ({ auth });
const loggedOut: AuthState = { user: null, token: null };
const loggedIn: AuthState = { user, token: 'token-1' };

describe('selectUser / selectToken', () => {
  it('reads the raw user/token off the slice', () => {
    expect(selectUser(stateWith(loggedIn))).toBe(user);
    expect(selectToken(stateWith(loggedIn))).toBe('token-1');
  });

  it('is null for both when signed out', () => {
    expect(selectUser(stateWith(loggedOut))).toBeNull();
    expect(selectToken(stateWith(loggedOut))).toBeNull();
  });
});

describe('selectIsAuth', () => {
  it('is true whenever a user is present, regardless of role', () => {
    expect(selectIsAuth(stateWith(loggedIn))).toBe(true);
    expect(selectIsAuth(stateWith({ user: { ...user, role: null }, token: 't' }))).toBe(true);
  });

  it('is false when signed out', () => {
    expect(selectIsAuth(stateWith(loggedOut))).toBe(false);
  });
});

describe('selectUserRole', () => {
  it("reads the user's role", () => {
    expect(selectUserRole(stateWith(loggedIn))).toBe('user');
  });

  it('is null when signed out or the role has not resolved yet', () => {
    expect(selectUserRole(stateWith(loggedOut))).toBeNull();
    expect(selectUserRole(stateWith({ user: { ...user, role: null }, token: 't' }))).toBeNull();
  });
});

describe('selectIsAdmin', () => {
  it('is true only for role === "admin"', () => {
    expect(selectIsAdmin(stateWith({ user: { ...user, role: 'admin' }, token: 't' }))).toBe(true);
  });

  it('is false for a non-admin role or signed out', () => {
    expect(selectIsAdmin(stateWith(loggedIn))).toBe(false);
    expect(selectIsAdmin(stateWith(loggedOut))).toBe(false);
  });
});

describe('selectUserName', () => {
  it('is null when signed out', () => {
    expect(selectUserName(stateWith(loggedOut))).toBeNull();
  });

  it("renders the user's username", () => {
    expect(selectUserName(stateWith(loggedIn))).toBe('janedoe');
  });

  // No production caller reads this selector (verified by grep) — this
  // pins its current, arguably-dead-code behavior rather than fixing it
  // silently: a user record with no username yet (e.g. mid-registration,
  // or a profile row where username hasn't been backfilled) renders the
  // literal string "undefined" via the template literal, not an empty
  // string or the user's email.
  it('stringifies a missing username as the literal "undefined"', () => {
    const noUsername = { ...user, username: undefined as unknown as string };
    expect(selectUserName(stateWith({ user: noUsername, token: 't' }))).toBe('undefined');
  });
});
