import {z} from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Minimum 3 characters'),
  email: z.email('Incorrect email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

export type LoginSchema = z.infer<typeof loginSchema>