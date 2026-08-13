import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PASSWORD_RULES } from './passwordRules';

const rule = (id: string) => PASSWORD_RULES.find((r) => r.id === id)!;

// `zxcvbn` (~800KB) is loaded via a dynamic import inside getPasswordScoreAsync
// — mocked here so the score tests don't pull in the real dictionary. The
// mock must live at the module's top level, not nested inside a describe:
// vi.mock is hoisted above the rest of the file regardless of where it's
// written, so a factory referencing a variable declared inside a describe
// block would run before that block's body ever executes.
const zxcvbnMock = vi.fn((password: string) => ({ score: password.length > 8 ? 4 : 1 }));

vi.mock('zxcvbn', () => ({
  default: (password: string) => zxcvbnMock(password),
}));

describe('PASSWORD_RULES — length', () => {
  const { test } = rule('length');

  it('fails just below the 6-character minimum', () => {
    expect(test('abcde')).toBe(false);
  });

  it('passes exactly at the 6-character minimum', () => {
    expect(test('abcdef')).toBe(true);
  });
});

describe('PASSWORD_RULES — english', () => {
  const { test } = rule('english');

  it('passes plain ASCII letters/numbers/symbols', () => {
    expect(test('Abc123!@#')).toBe(true);
  });

  it('fails on a non-ASCII character', () => {
    expect(test('Abc123á')).toBe(false);
  });

  // The `+` quantifier requires at least one char — an empty password fails
  // this rule too, not just the length rule.
  it('fails on an empty string', () => {
    expect(test('')).toBe(false);
  });

  it('passes a password containing a space (0x20 is in range)', () => {
    expect(test('Abc 123')).toBe(true);
  });

  it('fails on a tab or newline (outside the 0x20–0x7E range)', () => {
    expect(test('Abc\t123')).toBe(false);
    expect(test('Abc\n123')).toBe(false);
  });
});

describe('PASSWORD_RULES — number', () => {
  const { test } = rule('number');

  it('fails with no digit', () => {
    expect(test('Abcdef')).toBe(false);
  });

  it('passes with at least one digit anywhere', () => {
    expect(test('Abcdef1')).toBe(true);
  });
});

describe('PASSWORD_RULES — uppercase', () => {
  const { test } = rule('uppercase');

  it('fails with no uppercase letter', () => {
    expect(test('abcdef1')).toBe(false);
  });

  it('passes with at least one uppercase letter', () => {
    expect(test('Abcdef1')).toBe(true);
  });
});

describe('getPasswordScoreAsync', () => {
  beforeEach(() => {
    zxcvbnMock.mockClear();
    vi.resetModules();
  });

  it('returns 0 for an empty password without loading zxcvbn at all', async () => {
    const { getPasswordScoreAsync } = await import('./passwordRules');
    const score = await getPasswordScoreAsync('');

    expect(score).toBe(0);
    expect(zxcvbnMock).not.toHaveBeenCalled();
  });

  it('resolves the score zxcvbn reports for a given password', async () => {
    const { getPasswordScoreAsync } = await import('./passwordRules');
    const score = await getPasswordScoreAsync('short123');

    expect(score).toBe(1);
    expect(zxcvbnMock).toHaveBeenCalledWith('short123');
  });

  // The single-entry memo is the whole point of this function — three
  // consumers (checklist, strength meter, Zod schema) can see the same
  // keystroke's password without each triggering its own zxcvbn run.
  it('memoizes: calling twice with the same password only runs zxcvbn once', async () => {
    const { getPasswordScoreAsync } = await import('./passwordRules');

    await getPasswordScoreAsync('repeatedpw');
    await getPasswordScoreAsync('repeatedpw');

    expect(zxcvbnMock).toHaveBeenCalledTimes(1);
  });

  it('re-runs zxcvbn once the password actually changes', async () => {
    const { getPasswordScoreAsync } = await import('./passwordRules');

    await getPasswordScoreAsync('first-password');
    const secondScore = await getPasswordScoreAsync('a-different-password');

    expect(zxcvbnMock).toHaveBeenCalledTimes(2);
    expect(secondScore).toBe(4);
  });
});
