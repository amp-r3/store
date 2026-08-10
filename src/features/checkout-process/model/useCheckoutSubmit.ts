import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UseFormSetError } from 'react-hook-form';
import { useHaptics } from '@/shared/lib/hooks';
import { getErrorMessage } from '@/shared/lib';
import { showToast } from '@/shared/ui';
import { useClearCartMutation, CartProduct } from '@/entities/cart';
import { useCreateOrderMutation, CreateOrderPayload } from '@/entities/order';
import { CheckoutFormValues } from './checkoutMasterSchema';

interface UseCheckoutSubmitParams {
  checkoutItems: CartProduct[];
  isShippingRequired: boolean;
  setError: UseFormSetError<CheckoutFormValues>;
}

export const useCheckoutSubmit = ({
  checkoutItems,
  isShippingRequired,
  setError,
}: UseCheckoutSubmitParams) => {
  const router = useRouter();
  const { success } = useHaptics();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [clearServerCart, { isLoading: isClearing }] = useClearCartMutation();

  const submitOrder = useCallback(
    async (formData: CheckoutFormValues) => {
      const payload: CreateOrderPayload = {
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
      };

      try {
        const { order_number: orderId } = await createOrder(payload).unwrap();
        // The order already exists at this point; a failed cart cleanup shouldn't read as a failed order.
        await clearServerCart()
          .unwrap()
          .catch(() => {});
        // checkout.items is cleared on the success page itself, not here — clearing it
        // before navigating races CheckoutGuard against the lazy-loaded success route.
        showToast('success', 'Order placed');
        success();

        router.replace(`/checkout/success?order=${encodeURIComponent(orderId)}`);
      } catch (err) {
        setError('root', { type: 'server', message: getErrorMessage(err) });
      }
    },
    [checkoutItems, isShippingRequired, createOrder, clearServerCart, router, success, setError],
  );

  return {
    submitOrder,
    isSubmitting: isCreating || isClearing,
  };
};
