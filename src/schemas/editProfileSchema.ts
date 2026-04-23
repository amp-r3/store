import { z } from 'zod'
import { loginSchema } from './loginSchema'

export const editProfileSchema = loginSchema.extend({
  firstName: z.string().min(2, 'Minimum 3 characters'),
  lastName:  z.string().min(2, 'Minimum 3 characters'),
})

export type EditProfileSchema = z.infer<typeof editProfileSchema>