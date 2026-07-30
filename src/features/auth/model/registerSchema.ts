import { z } from 'zod';
import { passwordField } from './newPasswordSchema';

export const registerSchema = z.object({
  email: z.email('Incorrect email'),
  password: passwordField,
  confirm: z.string()
}).refine(
  (data) => data.password === data.confirm,
  { message: "The passwords don't match", path: ['confirm'] }
);

export type RegisterSchema = z.infer<typeof registerSchema>;
