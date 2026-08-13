import { describe, it, expect } from 'vitest';
import { changePasswordSchema } from './changePasswordSchema';

// passwordField (newPasswordSchema.ts) is an async superRefine (zxcvbn),
// which makes the whole object schema async — safeParse throws on an async
// refinement, safeParseAsync is required. Mirrors registerSchema.test.ts.
const STRONG_PASSWORD = 'Zq7#Wmt4Xrpl9K';
const OTHER_STRONG_PASSWORD = 'Bq3$Novz8Hrqm2';

describe('changePasswordSchema', () => {
  it('requires a non-empty currentPassword', async () => {
    const result = await changePasswordSchema.safeParseAsync({
      currentPassword: '',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'currentPassword')?.message).toBe(
        'Enter your current password',
      );
    }
  });

  it('reports a confirm mismatch on the confirm field', async () => {
    const result = await changePasswordSchema.safeParseAsync({
      currentPassword: 'old-password',
      password: STRONG_PASSWORD,
      confirm: 'SomethingElse123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message === "The passwords don't match");
      expect(issue?.path).toEqual(['confirm']);
    }
  });

  it('rejects a new password identical to the current one, on the password field', async () => {
    const result = await changePasswordSchema.safeParseAsync({
      currentPassword: STRONG_PASSWORD,
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === 'The new password must be different from the current one',
      );
      expect(issue?.path).toEqual(['password']);
    }
  });

  it('accepts a fully valid payload with a genuinely new password', async () => {
    const result = await changePasswordSchema.safeParseAsync({
      currentPassword: 'old-password',
      password: OTHER_STRONG_PASSWORD,
      confirm: OTHER_STRONG_PASSWORD,
    });
    expect(result.success).toBe(true);
  });
});
