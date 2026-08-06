import { z } from 'zod';
import { PASSWORD_RULES, STRENGTH_RULE, PASSWORD_MIN_STRENGTH_SCORE, getPasswordScoreAsync } from '@/shared/lib';

/** Single source of truth for "a password we'd accept", shared by register
 * and change-password. Async because the strength check (zxcvbn) is loaded
 * on demand — zodResolver (see LoginForm/RegisterForm/ChangePasswordForm)
 * awaits schema validation regardless, so this doesn't need special
 * handling at the call sites. */
export const passwordField = z.string().superRefine(async (password, ctx) => {
  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failedRule) {
    ctx.addIssue({ code: 'custom', message: failedRule.message });
    return;
  }
  const score = await getPasswordScoreAsync(password);
  if (score < PASSWORD_MIN_STRENGTH_SCORE) {
    ctx.addIssue({ code: 'custom', message: STRENGTH_RULE.message });
  }
});
