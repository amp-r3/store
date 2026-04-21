import {z} from 'zod'

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 characters'),
  lastName: z.string().min(2, 'Minimum 2 characters'),
  username: z.string().min(3, 'Minimum 3 characters'),
  email: z.email('Incorrect email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirm: z.string()
}).refine(
  (data) => data.password === data.confirm,
  { message: "The passwords don't match", path: ['confirm'] }
)