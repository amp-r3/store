import { z } from 'zod';
import { PASSWORD_RULES } from '@/shared/lib';

/** Single source of truth for "a password we'd accept", shared by register,
 * reset-password and change-password. */
export const passwordField = z.string().superRefine((password, ctx) => {
  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failedRule) {
    ctx.addIssue({ code: 'custom', message: failedRule.message });
  }
});

export const newPasswordSchema = z.object({
  password: passwordField,
  confirm: z.string(),
}).refine(
  (data) => data.password === data.confirm,
  { message: "The passwords don't match", path: ['confirm'] }
);

export type NewPasswordSchema = z.infer<typeof newPasswordSchema>;
