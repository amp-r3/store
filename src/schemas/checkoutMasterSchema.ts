import z from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const contactSchema = z.object({
  firstName: z.string().min(2, "The first name is too short"),
  lastName: z.string().min(2, "The last name is too short"),
  email: z.string().regex(emailRegex, { message: "Incorrect email format" }),
  phone: z.string().min(9, "Incorrect phone number")
});

const deliverySchema = z.object({
  deliveryMethodId: z.string().regex(uuidRegex, { message: "Please select a delivery method" }),

  deliveryMethodCode: z.enum(['standard', 'express', 'pickup']).optional(),

  country: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  housenumber: z.string().optional(),
  postcode: z.string().optional(),
});

const paymentSchema = z.object({
  paymentMethodCode: z.enum(['cash_on_delivery', 'online_card', 'paypal', 'sepa', 'klarna']).optional(),

  paymentMethodId: z.string().regex(uuidRegex, { message: "Please select a payment method" }),
});

export const checkoutMasterSchema = contactSchema
  .extend(deliverySchema.shape)
  .extend(paymentSchema.shape)
  .superRefine((data, ctx) => {

    if (data.deliveryMethodCode && data.deliveryMethodCode !== 'pickup') {

      if (!data.country || data.country.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          message: 'Country is required (min 2 characters)',
          path: ['country']
        });
      }

      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          message: 'City is required (min 2 characters)',
          path: ['city']
        });
      }

      if (!data.street || data.street.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: 'Street is required (min 3 characters)',
          path: ['street']
        });
      }

      if (!data.housenumber || data.housenumber.trim().length < 1) {
        ctx.addIssue({
          code: "custom",
          message: 'House number is required',
          path: ['housenumber']
        });
      }

      if (!data.postcode || data.postcode.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: 'Postcode is required (min 3 characters)',
          path: ['postcode']
        });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutMasterSchema>;