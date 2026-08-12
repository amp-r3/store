import { describe, it, expect } from 'vitest';
import { editProfileSchema } from './editProfileSchema';

const base = { username: 'validuser', email: 'user@example.com' };

describe('editProfileSchema', () => {
  it('accepts firstName/lastName being omitted entirely', () => {
    expect(editProfileSchema.safeParse(base).success).toBe(true);
  });

  it('accepts firstName/lastName as an empty string', () => {
    // optionalMin3's `!val ||` short-circuit treats '' the same as undefined.
    const result = editProfileSchema.safeParse({ ...base, firstName: '', lastName: '' });
    expect(result.success).toBe(true);
  });

  it('rejects a firstName/lastName under 3 characters when non-empty', () => {
    const result = editProfileSchema.safeParse({ ...base, firstName: 'ab' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Minimum 3 characters');
    }
  });

  it('accepts a firstName/lastName at exactly 3 characters', () => {
    expect(editProfileSchema.safeParse({ ...base, firstName: 'Jon' }).success).toBe(true);
  });

  it('requires username at a minimum of 3 characters', () => {
    const result = editProfileSchema.safeParse({ ...base, username: 'ab' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'username')?.message).toBe(
        'Minimum 3 characters',
      );
    }
  });

  it('treats an empty email string as absent rather than invalid', () => {
    // The z.preprocess turns '' into undefined before the inner email check.
    expect(editProfileSchema.safeParse({ ...base, email: '' }).success).toBe(true);
  });

  it('rejects a malformed non-empty email', () => {
    const result = editProfileSchema.safeParse({ ...base, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email address.');
    }
  });
});
