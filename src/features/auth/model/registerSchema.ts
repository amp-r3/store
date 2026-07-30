import { z } from 'zod';
import { PASSWORD_RULES } from './passwordRules';

export const registerSchema = z.object({
  email: z.email('Incorrect email'),
  password: z.string().superRefine((password, ctx) => {
    const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
    if (failedRule) {
      ctx.addIssue({ code: 'custom', message: failedRule.message });
    }
  }),
  confirm: z.string()
}).refine(
  (data) => data.password === data.confirm,
  { message: "The passwords don't match", path: ['confirm'] }
);

export type RegisterSchema = z.infer<typeof registerSchema>;
