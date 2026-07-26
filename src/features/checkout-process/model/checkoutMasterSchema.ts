import z from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const contactShape = {
  firstName: z.string().min(2, "The first name is too short"),
  lastName: z.string().min(2, "The last name is too short"),
  email: z.string().regex(emailRegex, { message: "Incorrect email format" }),
  phone: z.string().regex(/^\+?\d{7,15}$/, "Incorrect phone number")
};

const deliveryShape = {
  deliveryMethodId: z.string().regex(uuidRegex, { message: "Please select a delivery method" }),

  deliveryMethodCode: z.enum(['standard', 'express', 'pickup']).optional(),

  country: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  housenumber: z.string().optional(),
  postcode: z.string().optional(),
};

const paymentShape = {
  paymentMethodCode: z.enum(['cash_on_delivery', 'online_card', 'paypal', 'sepa', 'klarna']).optional(),

  paymentMethodId: z.string().regex(uuidRegex, { message: "Please select a payment method" }),
};

const addressRefine = (data: z.infer<z.ZodObject<typeof deliveryShape>>, ctx: z.RefinementCtx) => {
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
};

export const CHECKOUT_STEP_SCHEMAS = {
  contacts: z.object(contactShape),
  delivery: z.object(deliveryShape).superRefine(addressRefine),
  payment: z.object(paymentShape),
} as const;

export const checkoutMasterSchema = z
  .object({ ...contactShape, ...deliveryShape, ...paymentShape })
  .superRefine(addressRefine);

export type CheckoutFormValues = z.infer<typeof checkoutMasterSchema>;