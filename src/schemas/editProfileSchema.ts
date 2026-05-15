import { z } from 'zod'


const optionalMin3 = z
  .string()
  .optional()
  .refine(val => !val || val.length >= 3, 'Minimum 3 characters')

export const editProfileSchema = z.object({
  firstName: optionalMin3,
  lastName: optionalMin3,
  username: z.string().min(3, 'Minimum 3 characters'),
  email: z.preprocess(
    (val: string) => (val === '' ? undefined : val),
    z.email({ message: 'Please enter a valid email address.' })
      .optional()
  )
})

export type EditProfileSchema = z.infer<typeof editProfileSchema>