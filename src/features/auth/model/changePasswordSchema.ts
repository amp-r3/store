import { z } from 'zod';
import { passwordField } from './newPasswordSchema';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  password: passwordField,
  confirm: z.string(),
})
  .refine((data) => data.password === data.confirm, {
    message: "The passwords don't match",
    path: ['confirm'],
  })
  .refine((data) => data.password !== data.currentPassword, {
    message: 'The new password must be different from the current one',
    path: ['password'],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
