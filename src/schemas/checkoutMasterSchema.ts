import z from "zod";

const contactSchema = z.object({
  firstName: z.string().min(2, "The first name is too short"),
  lastName: z.string().min(2, "The last name is too short"),
  email: z.email("Incorrect email format"),
  phone: z.string().min(9, "Incorrect phone number")
});

const deliverySchema = z.object({
  deliveryMethod: z.enum(['express', 'standard', 'pickup']),
  country: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  housenumber: z.string().optional(),
  postcode: z.string().optional(),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(['online', 'onDelivery']),
  cardNumber: z.string().optional(),
  cardDate: z.string().optional(),
  cardHolder: z.string().optional(),
  cvc: z.string().optional()
});

export const checkoutMasterSchema = z.object({
  ...contactSchema.shape,
  ...deliverySchema.shape,
  ...paymentSchema.shape,
}).superRefine((data, ctx) => {

  if (data.deliveryMethod === 'standard' || data.deliveryMethod === 'express') {

    if (!data.country || data.country.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: 'Country is required (min 2 characters)',
        path: ['country'],
      });
    }

    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: 'City is required (min 2 characters)',
        path: ['city'],
      });
    }

    if (!data.street || data.street.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        message: 'Street is required (min 3 characters)',
        path: ['street'],
      });
    }

    if (!data.housenumber || data.housenumber.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        message: 'House number is required',
        path: ['housenumber'],
      });
    }

    if (!data.postcode || data.postcode.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        message: 'Postcode is required (min 3 characters)',
        path: ['postcode'],
      });
    }
  }

  if (data.paymentMethod === 'online') {

    const cleanCardNumber = data.cardNumber ? data.cardNumber.replace(/\s/g, '') : '';

    if (cleanCardNumber.length < 16) {
      ctx.addIssue({
        code: "custom",
        message: 'Card number must be at least 16 digits long',
        path: ['cardNumber'],
      });
    }

    if (!data.cardDate || data.cardDate.trim().length < 4) {
      ctx.addIssue({
        code: "custom",
        message: 'Expiration date must be at least 4 digits long (MM/YY)',
        path: ['cardDate'],
      });
    }

    if (!data.cardHolder || data.cardHolder.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: 'Cardholder name is required',
        path: ['cardHolder'],
      });
    }

    if (!data.cvc || data.cvc.trim().length !== 3) {
      ctx.addIssue({
        code: "custom",
        message: 'CVC must be exactly 3 digits long',
        path: ['cvc'],
      });
    }
  }
});

export type CheckoutFormValues = z.infer<typeof checkoutMasterSchema>;