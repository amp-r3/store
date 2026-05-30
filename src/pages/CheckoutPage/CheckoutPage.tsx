import { BackButton } from "@/components/common"
import { useAppSelector, useCartDetails } from "@/hooks"
import { useState } from "react"
import { useNavigate } from "react-router"
import styles from './checkout-page.module.scss'
import { selectUser } from "@/store/selectors/authSelectors"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckoutContacts } from "./components/CheckoutContacts/CheckoutContacts"
import { CheckoutShipping } from "./components/ChecoutShipping/CheckoutShipping"
import { CheckoutFormValues, checkoutMasterSchema } from "@/schemas/checkoutMasterSchema"
import { CheckoutPayments } from "./components/CheckoutPayments/CheckoutPayments"
import { CheckoutSummary } from "./components/CheckoutSummary/CheckoutSummary"
import { Header } from "@/components/layout/Header/Header"
import { CheckoutStepBar } from "./components/CheckoutStepBar/CheckoutStepBar"
import { useCreateOrderMutation, useGetDeliveryMethodsQuery, useGetPaymentMethodsQuery } from "@/services/checkoutApi"
import { DeliveryOptions, PaymentOptions } from "@/types/checkout"
import { useClearCartMutation } from "@/services/cartApi"

const STEPS_ORDER = ['contacts', 'delivery', 'payment'] as const;

export type StepType = typeof STEPS_ORDER[number];


export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartDetails, totals, isLoading, isFetching, cartItems } = useCartDetails()
  const { data: deliveryMethods, isLoading: isDeliveryLoading } = useGetDeliveryMethodsQuery();
  const { data: paymentMethods, isLoading: isPaymentLoading } = useGetPaymentMethodsQuery();
  const [clearServerCart, { isLoading: isClearing }] = useClearCartMutation();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const user = useAppSelector(selectUser)
  const [step, setStep] = useState<StepType>('contacts')
  const [highestStepIndex, setHighestStepIndex] = useState<number>(0);

  const currentIndex = STEPS_ORDER.indexOf(step);
  const isLastStep = currentIndex === STEPS_ORDER.length - 1;


  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutMasterSchema),
    mode: 'onChange',
    defaultValues: {
      paymentMethodId: '',
      deliveryMethodId: '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    },
  });

  const deliveryCode = methods.watch('deliveryMethodCode');
  const paymentCode = methods.watch('paymentMethodCode')

  const isShippingRequired = deliveryCode !== 'pickup';


  const handleDeliverySelect = (id: string, code: DeliveryOptions) => {
    methods.setValue('deliveryMethodId', id, { shouldValidate: true });

    methods.setValue('deliveryMethodCode', code, { shouldValidate: true });
  };

  const handlePaymentSelect = (id: string, code: PaymentOptions) => {
    methods.setValue('paymentMethodId', id, { shouldValidate: true })
    methods.setValue('paymentMethodCode', code, { shouldValidate: true })
  }

  const handleNextStep = async () => {
    let isStepValid = false;

    if (step === 'contacts') {
      isStepValid = await methods.trigger(['firstName', 'lastName', 'email', 'phone'])
    } else if (step === 'delivery') {
      isStepValid = await methods.trigger([
        'deliveryMethodId', 'deliveryMethodCode', 'country', 'city', 'street', 'housenumber', 'postcode'
      ]);
    }

    if (isStepValid) {
      methods.clearErrors();

      const nextIndex = currentIndex + 1;
      setStep(STEPS_ORDER[nextIndex]);

      if (nextIndex > highestStepIndex) {
        setHighestStepIndex(nextIndex);
      }
    }
  }

  const handleBreadcrumbClick = async (targetStep: StepType) => {
    const targetIndex = STEPS_ORDER.indexOf(targetStep);
    const currentIndex = STEPS_ORDER.indexOf(step);

    if (targetIndex < currentIndex) {
      setStep(targetStep);
      return;
    }

    if (targetIndex > currentIndex && targetIndex <= highestStepIndex) {
      let isStepValid = false;

      if (step === 'contacts') {
        isStepValid = await methods.trigger(['firstName', 'lastName', 'email', 'phone']);
      } else if (step === 'delivery') {
        isStepValid = await methods.trigger([
          'deliveryMethodId', 'deliveryMethodCode', 'country', 'city', 'street', 'housenumber', 'postcode'
        ]);
      } else if (step === 'payment') {
        isStepValid = await methods.trigger(['paymentMethodId']);
      }

      if (isStepValid) {
        setStep(targetStep);
      }
    }
  };


  const onSubmit = async (formData: CheckoutFormValues) => {
    if (!isLastStep) {
      return;
    }
    const payload = {
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
      p_items: cartItems.map((item) => { return { product_id: item.id, quantity: item.quantity } })
    };

    try {
      const { order_number: orderId } = await createOrder(payload).unwrap();
      await clearServerCart(undefined).unwrap();
      navigate('/checkout/success', {
        state: { orderId },
        replace: true
      })
    } catch (err) {
      console.error(err);
    }
  };


  const updatedDeliveryMethods = deliveryMethods?.map((opt) => {

    if (opt.code === 'standard' && totals.remainingForFreeShipping <= 0) {
      return { ...opt, price: 0 }
    }

    return opt
  })
  const selectedDeliveryMethod = updatedDeliveryMethods?.find(method => method?.code === deliveryCode);
  const selectedPaymentMethod = paymentMethods?.find(method => method.code === paymentCode)


  return (
    <>
      <main className={styles.checkout}>
        <Header />
        <div className={styles.checkout__container + ' container'}>

          {/* Header */}
          <header className={styles.checkout__header}>
            <BackButton onClick={() => navigate(-1)} />
            <h1 className={styles.checkout__title}>Checkout</h1>
          </header>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} id='checkout-form' className={styles.checkout__body}>
              <section className={styles.checkout__form}>

                {/* Step tabs */}
                <CheckoutStepBar
                  currentStep={step}
                  stepsOrder={STEPS_ORDER}
                  highestStepIndex={highestStepIndex}
                  setStep={handleBreadcrumbClick}
                />

                {step === 'contacts' && (
                  <CheckoutContacts />
                )}

                {step === 'delivery' && (
                  <CheckoutShipping
                    isLoading={isDeliveryLoading}
                    selectedDelivery={selectedDeliveryMethod}
                    deliveryOptions={updatedDeliveryMethods}
                    isShippingRequiered={isShippingRequired}
                    handleSelect={handleDeliverySelect}
                  />
                )}

                {step === 'payment' && (
                  <CheckoutPayments
                    paymentMethods={paymentMethods}
                    isLoading={isPaymentLoading}
                    handleSelect={handlePaymentSelect}
                  />
                )}
              </section>

              <CheckoutSummary
                cartDetails={cartDetails}
                cartItems={cartItems}

                subtotal={totals.subtotal}
                cartTotal={totals.total}
                discountAmount={totals.discountAmount}
                discountPercent={totals.discountPercent}
                remainingForFreeShipping={totals.remainingForFreeShipping}

                selectedDelivery={selectedDeliveryMethod}
                selectedPayment={selectedPaymentMethod}

                step={step}
                isLastStep={isLastStep}
                isLoading={isLoading || isFetching}
                isCreating={isCreating || isClearing}
                handleNextStep={handleNextStep}
                onSubmit={onSubmit}
              />

            </form>

          </FormProvider>
        </div>
      </main>
    </>
  )
}