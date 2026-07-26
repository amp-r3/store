import { createContext, FC, ReactNode, useContext, useEffect, useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import {
  selectCartItemsArray,
  CartProduct,
  CartItemDetails,
  calculateCartTotals,
  calculateOrderTotals,
} from '@/entities/cart';
import { DeliveryMethod, PaymentMethod, DeliveryOptions, PaymentOptions } from '@/entities/order';
import { addToCheckout } from './checkoutSlice';
import { StepType } from './types';
import { useCheckoutForm } from './useCheckoutForm';
import { useCheckoutDelivery } from './useCheckoutDelivery';
import { useCheckoutDetails } from './useCheckoutDetails';
import { useCheckoutStepper } from './useCheckoutStepper';
import { useCheckoutSubmit } from './useCheckoutSubmit';
import { useCheckoutTotals } from './useCheckoutTotals';
import { CheckoutFormValues } from './checkoutMasterSchema';

interface CheckoutContextValue {
  checkoutItems: CartProduct[];
  checkoutDetails: (CartItemDetails | null)[];
  totals: ReturnType<typeof calculateCartTotals>;
  orderTotals: ReturnType<typeof calculateOrderTotals>;
  deliveryMethods?: DeliveryMethod[];
  paymentMethods?: PaymentMethod[];
  selectedDelivery?: DeliveryMethod;
  selectedPayment?: PaymentMethod;
  isShippingRequired: boolean;
  isDeliveryLoading: boolean;
  isPaymentLoading: boolean;
  selectDelivery(id: string, code: DeliveryOptions): void;
  selectPayment(id: string, code: PaymentOptions): void;
  step: StepType;
  stepIndex: number;
  isLastStep: boolean;
  maxReachedIndex: number;
  goNext(): Promise<void>;
  goToStep(step: StepType): Promise<void>;
  isLoading: boolean;
  isSubmitting: boolean;
  submitOrder(formData: CheckoutFormValues): Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export const CheckoutProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItemsArray);

  const { methods, selectDelivery, selectPayment, applyPaymentSelection } = useCheckoutForm();
  const { watch, setError } = methods;

  const deliveryCode = watch('deliveryMethodCode');
  const paymentCode = watch('paymentMethodCode');
  const currentPaymentMethodId = watch('paymentMethodId');

  const delivery = useCheckoutDelivery(deliveryCode, paymentCode);
  const details = useCheckoutDetails(delivery.freeShippingThreshold);
  const stepper = useCheckoutStepper(methods);

  useEffect(() => {
    if (details.isEmpty && cartItems.length > 0) {
      dispatch(addToCheckout(cartItems));
    }
  }, [details.isEmpty, cartItems, dispatch]);

  useEffect(() => {
    if (delivery.paymentMethods && delivery.paymentMethods.length > 0 && !currentPaymentMethodId) {
      applyPaymentSelection(delivery.paymentMethods[0].id, delivery.paymentMethods[0].code);
    }
  }, [delivery.paymentMethods, currentPaymentMethodId, applyPaymentSelection]);

  const orderTotals = useCheckoutTotals({
    cartTotal: details.totals.total,
    selectedDelivery: delivery.selectedDelivery,
    selectedPayment: delivery.selectedPayment,
  });

  const { submitOrder, isSubmitting } = useCheckoutSubmit({
    checkoutItems: details.checkoutItems,
    isShippingRequired: delivery.isShippingRequired,
    setError,
  });

  const value = useMemo<CheckoutContextValue>(() => ({
    checkoutItems: details.checkoutItems,
    checkoutDetails: details.checkoutDetails,
    totals: details.totals,
    orderTotals,
    deliveryMethods: delivery.deliveryMethods,
    paymentMethods: delivery.paymentMethods,
    selectedDelivery: delivery.selectedDelivery,
    selectedPayment: delivery.selectedPayment,
    isShippingRequired: delivery.isShippingRequired,
    isDeliveryLoading: delivery.isDeliveryLoading,
    isPaymentLoading: delivery.isPaymentLoading,
    selectDelivery,
    selectPayment,
    step: stepper.step,
    stepIndex: stepper.stepIndex,
    isLastStep: stepper.isLastStep,
    maxReachedIndex: stepper.maxReachedIndex,
    goNext: stepper.goNext,
    goToStep: stepper.goToStep,
    isLoading: details.isLoading || details.isFetching,
    isSubmitting,
    submitOrder,
  }), [details, orderTotals, delivery, selectDelivery, selectPayment, stepper, isSubmitting, submitOrder]);

  return (
    <FormProvider {...methods}>
      <CheckoutContext.Provider value={value}>
        {children}
      </CheckoutContext.Provider>
    </FormProvider>
  );
};

export const useCheckoutContext = (): CheckoutContextValue => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return context;
};
