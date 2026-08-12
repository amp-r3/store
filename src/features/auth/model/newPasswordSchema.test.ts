import { describe, it, expect } from 'vitest';
import { PASSWORD_RULES, STRENGTH_RULE } from '@/shared/lib';
import { passwordField } from './newPasswordSchema';

const ruleMessage = (id: string) => PASSWORD_RULES.find((r) => r.id === id)!.message;

// High-entropy, clears zxcvbn's PASSWORD_MIN_STRENGTH_SCORE floor.
const STRONG_PASSWORD = 'Zq7#Wmt4Xrpl9K';

describe('passwordField', () => {
  it('reports the length rule for a too-short password', async () => {
    const result = await passwordField.safeParseAsync('Ab1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(ruleMessage('length'));
    }
  });

  it('reports only the first failing rule, not every rule that fails', async () => {
    // Long enough, ASCII, but has neither a digit nor an uppercase letter —
    // PASSWORD_RULES.find() stops at "number" (index 2), so "uppercase"
    // never gets a chance to report even though it also fails.
    const result = await passwordField.safeParseAsync('abcdefgh');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].message).toBe(ruleMessage('number'));
    }
  });

  it('reports the uppercase rule once length/ASCII/number all pass', async () => {
    const result = await passwordField.safeParseAsync('abcdef1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(ruleMessage('uppercase'));
    }
  });

  it('reports the ASCII-only rule for non-Latin characters', async () => {
    const result = await passwordField.safeParseAsync('passwörd1A');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(ruleMessage('english'));
    }
  });

  it('reports the strength rule when every sync rule passes but zxcvbn scores it too low', async () => {
    const result = await passwordField.safeParseAsync('Password1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(STRENGTH_RULE.message);
    }
  });

  it('accepts a password that passes every sync rule and clears the strength floor', async () => {
    const result = await passwordField.safeParseAsync(STRONG_PASSWORD);
    expect(result.success).toBe(true);
  });
});
