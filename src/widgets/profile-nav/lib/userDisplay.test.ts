import { describe, it, expect } from 'vitest';
import { getInitial, getDisplayName } from './userDisplay';
import { SessionUser } from '@/entities/session';

const baseUser: SessionUser = {
  id: 'user-1',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  role: 'user',
  accessToken: 'token-1',
};

describe('getInitial', () => {
  it('uses the first letter of firstName when present', () => {
    expect(getInitial(baseUser)).toBe('J');
  });

  it('falls back to lastName when firstName is missing', () => {
    expect(getInitial({ ...baseUser, firstName: null })).toBe('D');
  });

  it('falls back to username when neither name is set', () => {
    expect(getInitial({ ...baseUser, firstName: null, lastName: null })).toBe('J');
  });

  it('falls back to "?" when nothing is available', () => {
    expect(getInitial({ ...baseUser, firstName: null, lastName: null, username: '' })).toBe('?');
  });

  it('uppercases a lowercase initial', () => {
    expect(getInitial({ ...baseUser, firstName: 'jane' })).toBe('J');
  });
});

describe('getDisplayName', () => {
  it('joins firstName and lastName when both are present', () => {
    expect(getDisplayName(baseUser)).toBe('Jane Doe');
  });

  it('uses just firstName when lastName is missing, with no trailing space', () => {
    expect(getDisplayName({ ...baseUser, lastName: null })).toBe('Jane');
  });

  it('uses just lastName when firstName is missing, with no leading space', () => {
    expect(getDisplayName({ ...baseUser, firstName: null })).toBe('Doe');
  });

  it('falls back to "@username" when neither name is set', () => {
    expect(getDisplayName({ ...baseUser, firstName: null, lastName: null })).toBe('@janedoe');
  });

  it('falls back to email when neither name nor username is set', () => {
    expect(getDisplayName({ ...baseUser, firstName: null, lastName: null, username: '' })).toBe(
      'jane@example.com',
    );
  });

  it('falls back to the literal "User" as a last resort', () => {
    expect(
      getDisplayName({
        ...baseUser,
        firstName: null,
        lastName: null,
        username: '',
        email: null,
      }),
    ).toBe('User');
  });
});
