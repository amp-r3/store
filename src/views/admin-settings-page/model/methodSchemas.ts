import { z } from 'zod';

const emptyToNull = (val: unknown) =>
  val === '' || val === null || val === undefined ? null : val;

export const deliveryMethodSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Too long'),
  price: z.coerce.number().min(0, 'Must be 0 or more'),
  estimatedTime: z.string().max(100, 'Too long').optional(),
  freeFromPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().min(0, 'Must be 0 or more').nullable(),
  ),
});

export type DeliveryMethodFormValues = z.infer<typeof deliveryMethodSchema>;

export const paymentMethodSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Too long'),
  feePercentage: z.coerce
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100'),
  feeFixed: z.coerce.number().min(0, 'Must be 0 or more'),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
