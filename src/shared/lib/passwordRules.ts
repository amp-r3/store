export interface PasswordRule {
  id: string;
  /** Shown in the live checklist as the user types. */
  label: string;
  /** Shown as the field's validation error once the rule fails on submit/blur. */
  message: string;
  test(password: string): boolean;
}

// zxcvbn's dictionary is ~800KB — load it on demand (first password
// keystroke or schema validation) rather than bundling it upfront.
let zxcvbnFn: ((password: string) => { score: number }) | null = null;
let zxcvbnLoadPromise: Promise<(password: string) => { score: number }> | null = null;

function loadZxcvbn() {
  if (zxcvbnFn) return Promise.resolve(zxcvbnFn);
  zxcvbnLoadPromise ??= import('zxcvbn').then((mod) => {
    zxcvbnFn = mod.default;
    return zxcvbnFn;
  });
  return zxcvbnLoadPromise;
}

// zxcvbn is expensive enough that running it once per consumer per keystroke
// (checklist, strength meter, schema superRefine) is noticeable. All three see
// the same password on any given keystroke, so a single-entry cache collapses
// them into one run.
let lastPassword: string | undefined;
let lastScore = 0;

export const getPasswordScoreAsync = async (password: string): Promise<number> => {
  if (!password) return 0;
  if (password !== lastPassword) {
    const zxcvbn = await loadZxcvbn();
    lastPassword = password;
    lastScore = zxcvbn(password).score;
  }
  return lastScore;
};

/** zxcvbn score 0–4, indexed by the resolved score. */
export const PASSWORD_STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;

export const PASSWORD_MIN_STRENGTH_SCORE = 2;

/** The zxcvbn-backed rule, kept separate from PASSWORD_RULES since its check
 * is inherently async (see getPasswordScoreAsync) — consumers that need it
 * alongside the synchronous rules (PasswordRequirements, the Zod schema)
 * combine it explicitly rather than through a uniform test(). */
export const STRENGTH_RULE = {
  id: 'strength',
  label: 'Password is not too weak',
  message: 'Password is too weak',
};

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: 'length',
    label: 'Minimum 6 characters',
    message: 'Minimum 6 characters',
    test: (password) => password.length >= 6,
  },
  {
    id: 'english',
    label: 'Only English characters, numbers, and symbols',
    message: 'Use only English characters, numbers, and symbols',
    test: (password) => /^[\x20-\x7E]+$/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number',
    message: 'Must contain at least one number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    message: 'Must contain at least one uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
];
