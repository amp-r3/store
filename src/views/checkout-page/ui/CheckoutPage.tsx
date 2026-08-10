import { PageLayout } from '@/shared/ui';
import styles from './checkout-page.module.scss';
import { useFormContext } from 'react-hook-form';
import {
  CheckoutContacts,
  CheckoutPayments,
  CheckoutSummary,
  CheckoutShipping,
  CheckoutSection,
  CheckoutStepActions,
  CheckoutProvider,
  useCheckoutContext,
  CheckoutFormValues,
  STEPS_ORDER,
} from '@/features/checkout-process';
import { TopBar } from '@/widgets/top-bar';
import { useMediaQuery } from '@/shared/lib/hooks';

const MOBILE_QUERY = '(max-width: 860px)';

const CheckoutPageContent = () => {
  const { stepIndex, submitOrder } = useCheckoutContext();
  const { handleSubmit } = useFormContext<CheckoutFormValues>();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <div className={styles.checkout}>
      <TopBar />
      <PageLayout className={styles.checkout__container}>
        <header className={styles.checkout__header}>
          <h1 className={styles.checkout__title}>Checkout</h1>
          <p className={styles.checkout__step_count}>
            Step {stepIndex + 1} of {STEPS_ORDER.length}
          </p>
        </header>

        <div className={styles.checkout__body}>
          <form
            onSubmit={handleSubmit(submitOrder)}
            id="checkout-form"
            className={styles.checkout__steps}
          >
            <CheckoutSection step="contacts">
              <CheckoutContacts />
            </CheckoutSection>
            <CheckoutSection step="delivery">
              <CheckoutShipping />
            </CheckoutSection>
            <CheckoutSection step="payment">
              <CheckoutPayments />
            </CheckoutSection>
          </form>

          <CheckoutSummary />
        </div>

        {isMobile && <CheckoutStepActions variant="bar" />}
      </PageLayout>
    </div>
  );
};

export const CheckoutPage = () => (
  <CheckoutProvider>
    <CheckoutPageContent />
  </CheckoutProvider>
);
