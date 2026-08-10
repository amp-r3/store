import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only'),
});

export type CategorySchema = z.infer<typeof categorySchema>;
