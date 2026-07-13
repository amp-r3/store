import { z } from 'zod';
import zxcvbn from 'zxcvbn';

export const registerSchema = z.object({
  email: z.email('Incorrect email'),
  password: z.string()
    .min(6, 'Minimum 6 characters')
    .regex(/^[\x20-\x7E]+$/, 'Use only English characters, numbers, and symbols')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .refine((val) => zxcvbn(val).score >= 2, { message: 'Password is too weak' }),
  confirm: z.string()
}).refine(
  (data) => data.password === data.confirm,
  { message: "The passwords don't match", path: ['confirm'] }
);

export type RegisterSchema = z.infer<typeof registerSchema>;