import { CheckoutStepBar } from "./components";
import { PageLayout, HOME_CRUMB } from "@/shared/ui"
import styles from './checkout-page.module.scss'
import { useFormContext } from "react-hook-form";
import {
  CheckoutContacts,
  CheckoutPayments,
  CheckoutSummary,
  CheckoutShipping,
  CheckoutProvider,
  useCheckoutContext,
  CheckoutFormValues,
} from "@/features/checkout-process"
import { TopBar } from "@/widgets/top-bar"

const CheckoutPageContent = () => {
  const { step, submitOrder } = useCheckoutContext();
  const { handleSubmit } = useFormContext<CheckoutFormValues>();

  return (
    <div className={styles.checkout}>
      <TopBar />
      <PageLayout
        breadcrumbs={[HOME_CRUMB, { label: 'Checkout' }]}
        className={styles.checkout__container}
      >
        <header className={styles.checkout__header}>
          <h1 className={styles.checkout__title}>Checkout</h1>
        </header>

        <form onSubmit={handleSubmit(submitOrder)} id='checkout-form' className={styles.checkout__body}>
          <section className={styles.checkout__form}>
            <CheckoutStepBar />

            {step === 'contacts' && <CheckoutContacts />}
            {step === 'delivery' && <CheckoutShipping />}
            {step === 'payment' && <CheckoutPayments />}
          </section>

          <CheckoutSummary />
        </form>
      </PageLayout>
    </div>
  )
}

export const CheckoutPage = () => (
  <CheckoutProvider>
    <CheckoutPageContent />
  </CheckoutProvider>
)
