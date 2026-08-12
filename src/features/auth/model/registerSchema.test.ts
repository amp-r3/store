import { describe, it, expect } from 'vitest';
import { registerSchema } from './registerSchema';

// passwordField (newPasswordSchema.ts) is an async superRefine (zxcvbn),
// which makes the whole object schema async — safeParse throws on an async
// refinement, safeParseAsync is required.
const STRONG_PASSWORD = 'Zq7#Wmt4Xrpl9K';

describe('registerSchema', () => {
  it('rejects a malformed email', async () => {
    const result = await registerSchema.safeParseAsync({
      email: 'not-an-email',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'email')?.message).toBe(
        'Incorrect email',
      );
    }
  });

  it('delegates password validation to passwordField', async () => {
    const result = await registerSchema.safeParseAsync({
      email: 'user@example.com',
      password: 'weak',
      confirm: 'weak',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(true);
    }
  });

  it('reports a mismatch on the confirm field, not password', async () => {
    const result = await registerSchema.safeParseAsync({
      email: 'user@example.com',
      password: STRONG_PASSWORD,
      confirm: 'SomethingElse123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message === "The passwords don't match");
      expect(issue?.path).toEqual(['confirm']);
    }
  });

  it('accepts a fully valid payload', async () => {
    const result = await registerSchema.safeParseAsync({
      email: 'user@example.com',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    expect(result.success).toBe(true);
  });
});
