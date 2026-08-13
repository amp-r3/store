import { CartProduct } from '@/entities/cart';
import { CreateOrderPayload } from '@/entities/order';
import { CheckoutFormValues } from './checkoutMasterSchema';

// Pickup orders (isShippingRequired === false) send the literal 'N/A' for
// every address field — the schema itself makes them optional for pickup
// (see checkoutMasterSchema.ts's addressRefine), so this is what keeps an
// undefined address field from reaching the create_order RPC.
export const buildCreateOrderPayload = (
  formData: CheckoutFormValues,
  checkoutItems: CartProduct[],
  isShippingRequired: boolean,
): CreateOrderPayload => ({
  p_shipping_address: {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    country: isShippingRequired ? formData.country : 'N/A',
    city: isShippingRequired ? formData.city : 'N/A',
    street: isShippingRequired ? formData.street : 'N/A',
    housenumber: isShippingRequired ? formData.housenumber : 'N/A',
    postcode: isShippingRequired ? formData.postcode : 'N/A',
  },
  p_payment_method_id: formData.paymentMethodId,
  p_delivery_method_id: formData.deliveryMethodId,
  p_items: checkoutItems.map((item) => ({
    product_id: item.productId,
    size_id: item.sizeId,
    quantity: item.quantity,
  })),
});
