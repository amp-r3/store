import { describe, it, expect } from 'vitest';
import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'email')?.message).toBe(
        'Incorrect email',
      );
    }
  });

  it('rejects a password under 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '12345' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'Minimum 6 characters',
      );
    }
  });

  it('imposes no strength requirement beyond length — unlike registerSchema/passwordField', () => {
    // A password that would fail every PASSWORD_RULES check (no uppercase,
    // no number) is still valid here: login only checks against an existing
    // account, it doesn't enforce policy on it.
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'weakpass' });
    expect(result.success).toBe(true);
  });

  it('accepts a fully valid payload', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });
});
