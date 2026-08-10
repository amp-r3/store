import { z } from 'zod';

const emptyToNull = (val: unknown) =>
  val === '' || val === null || val === undefined ? null : val;

const basicsShape = {
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  categoryId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable()),
  brand: z.string().max(100, 'Too long').optional(),
  sku: z.string().max(100, 'Too long').optional(),
};

const pricingShape = {
  basePrice: z.coerce.number().min(0, 'Price must be 0 or more'),
  discountPercentage: z.coerce
    .number()
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100'),
};

const logisticsShape = {
  weight: z.preprocess(emptyToNull, z.coerce.number().min(0, 'Must be 0 or more').nullable()),
  dimensions: z.object({
    width: z.coerce.number().min(0, 'Must be 0 or more'),
    height: z.coerce.number().min(0, 'Must be 0 or more'),
    depth: z.coerce.number().min(0, 'Must be 0 or more'),
  }),
  shippingInformation: z.string().max(500, 'Too long').optional(),
  minimumOrderQuantity: z.coerce.number().int().min(1, 'At least 1'),
};

const additionalShape = {
  warrantyInformation: z.string().max(500, 'Too long').optional(),
  returnPolicy: z.string().max(500, 'Too long').optional(),
  availabilityStatus: z.string().min(1, 'Select a status'),
  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty')),
  barcode: z.string().max(100, 'Too long').optional(),
  qrCode: z.string().max(100, 'Too long').optional(),
};

export const productSchema = z.object({
  ...basicsShape,
  ...pricingShape,
  ...logisticsShape,
  ...additionalShape,
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
