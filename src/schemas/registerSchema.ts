import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Incorrect email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirm: z.string()
}).refine(
  (data) => data.password === data.confirm,
  { message: "The passwords don't match", path: ['confirm'] }
);

export type RegisterSchema = z.infer<typeof registerSchema>