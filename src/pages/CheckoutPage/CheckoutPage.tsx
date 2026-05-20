import { BackButton } from "@/components/common"
import { useAppSelector, useCartDetails } from "@/hooks"
import { ReactNode, useMemo, useState } from "react"
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
import { calculateCartTotals } from "@/utils"
import { Header } from "@/components/layout/Header/Header"
import { CheckoutStepBar } from "./components/CheckoutStepBar/CheckoutStepBar"
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

export type DeliveryMethod = 'standard' | 'express' | 'pickup'

export type PaymentMethod = 'online' | 'onDelivery'


const STEPS_ORDER = ['contacts', 'delivery', 'payment'] as const;

export type StepType = typeof STEPS_ORDER[number];

export interface DeliveryOption {
  id: DeliveryMethod;
  label: string;
  duration: string;
  price: number
}

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: ReactNode;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'standard', label: 'Standard', duration: '5–7 days', price: 4.99 },
  { id: 'express', label: 'Express', duration: '1–2 days', price: 9.99 },
  { id: 'pickup', label: 'Pickup', duration: 'Today', price: 0 },
]

const PAYMENT_METHODS: PaymentOption[] = [
  { id: 'online', label: 'Online', icon: <FaCreditCard /> },
  { id: 'onDelivery', label: 'Upon delivery', icon: <FaMoneyBillWave /> },
]


export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartDetails, isLoading, cartItems, totalQuantity } = useCartDetails()
  const user = useAppSelector(selectUser)
  const [step, setStep] = useState<StepType>('contacts')
  const [highestStepIndex, setHighestStepIndex] = useState<number>(0);

  const currentIndex = STEPS_ORDER.indexOf(step);
  const isLastStep = currentIndex === STEPS_ORDER.length - 1;


  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutMasterSchema),
    mode: 'onChange',
    defaultValues: {
      deliveryMethod: 'standard',
      paymentMethod: 'onDelivery'
    },
  });

  const handleNextStep = async () => {
    let isStepValid = false;

    if (step === 'contacts') {
      isStepValid = await methods.trigger(['firstName', 'lastName', 'email', 'phone'])
    } else if (step === 'delivery') {
      isStepValid = await methods.trigger(['deliveryMethod', 'country', 'city', 'street', 'housenumber', 'postcode'])
    } else if (step === 'payment') {
      isStepValid = await methods.trigger(['paymentMethod', 'cardHolder', 'cardNumber', 'cardDate', 'cvc'])
    }

    if (isStepValid) {
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
          'deliveryMethod', 'country', 'city', 'street', 'housenumber', 'postcode'
        ]);
      } else if (step === 'payment') {
        isStepValid = await methods.trigger([
          'paymentMethod', 'cardNumber', 'cardDate', 'cardHolder', 'cvc'
        ]);
      }

      if (isStepValid) {
        setStep(targetStep);
      }
    }
  };


  const onSubmit = async (data: CheckoutFormValues) => {
    console.log('Collected data from all steps:', data);
  };

  const deliveryMethod = methods.watch('deliveryMethod');

  const paymentMethod = methods.watch('paymentMethod')

  const selectedDelivery = DELIVERY_OPTIONS.find(o => o.id === deliveryMethod)

  const {
    subtotal,
    total,
    discountAmount,
    discountPercent,
    shippingProgress,
    remainingForFreeShipping,
  } = useMemo(() => {
    const validCartItems = cartDetails.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    return calculateCartTotals(validCartItems);
  }, [cartDetails]);


  const updatedDeliveryOptions = DELIVERY_OPTIONS.map((opt) => {
    if (opt.id === 'standard' && remainingForFreeShipping <= 0) {
      return { ...opt, price: 0 }
    }

    return opt
  })

  const deliveryCost = remainingForFreeShipping <= 0 && selectedDelivery.id !== 'express' ? 0 : selectedDelivery.price;

  const totalPrice = total + deliveryCost

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
                  <CheckoutContacts user={user} />
                )}

                {step === 'delivery' && (
                  <CheckoutShipping
                    deliveryOptions={updatedDeliveryOptions} />
                )}

                {step === 'payment' && (
                  <CheckoutPayments paymentMethods={PAYMENT_METHODS} />
                )}
              </section>

              <CheckoutSummary
                cartDetails={cartDetails}
                cartItems={cartItems}
                deliveryCost={deliveryCost}
                subtotal={subtotal}
                total={totalPrice}
                discountAmount={discountAmount}
                discountPercent={discountPercent}
                remainingForFreeShipping={remainingForFreeShipping}
                shippingProgress={shippingProgress}
                step={step}
                selectedDelivery={selectedDelivery}
                isLastStep={isLastStep}
                handleNextStep={handleNextStep}
              />

            </form>

          </FormProvider>
        </div>
      </main>
    </>
  )
}