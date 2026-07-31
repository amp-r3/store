import { z } from 'zod';
import { PASSWORD_RULES } from '@/shared/lib';

/** Single source of truth for "a password we'd accept", shared by register
 * and change-password. */
export const passwordField = z.string().superRefine((password, ctx) => {
  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failedRule) {
    ctx.addIssue({ code: 'custom', message: failedRule.message });
  }
});
