import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { HiChevronDown, HiLockClosed } from 'react-icons/hi';
import { CheckoutFormValues } from '../../model/checkoutMasterSchema';
import { useCheckoutContext } from '../../model/CheckoutContext';
import style from './checkout-summary.module.scss';
import { formatPrice } from '@/shared/lib';
import { useHaptics } from '@/shared/lib/hooks';
import { Alert } from '@/shared/ui';
import { SummaryItems, SummaryTotals } from './components';

export const CheckoutSummary = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { soft } = useHaptics();

  const { orderTotals, checkoutItems } = useCheckoutContext();
  const {
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const toggleExpanded = () => {
    soft();
    setIsExpanded(!isExpanded);
  };

  return (
    <aside className={style.summary}>
      {/* Mobile Header: Visible only on mobile, toggles expansion */}
      <button
        type="button"
        className={`${style.summary__mobile_header} ${isExpanded ? style['summary__mobile_header--expanded'] : ''}`}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className={style.summary__mobile_header_info}>
          <span className={style.summary__mobile_header_title}>Order Summary</span>
          <span className={style.summary__mobile_header_total}>
            {formatPrice(orderTotals.finalTotalPrice)}
          </span>
        </div>
        <HiChevronDown
          className={`${style.summary__mobile_toggle} ${isExpanded ? style['summary__mobile_toggle--active'] : ''}`}
        />
      </button>

      {/* Collapsible Content */}
      <div
        className={`${style.summary__collapsible} ${isExpanded ? style['summary__collapsible--expanded'] : ''}`}
      >
        <div className={style.summary__collapsible_inner}>
          <h2 className={style.summary__title}>
            Order Summary
            <span className={style.summary__count}>{checkoutItems.length} items</span>
          </h2>

          <SummaryItems />

          <div className={style.summary__divider} role="presentation" />

          <SummaryTotals />

          <div className={style.summary__divider} role="presentation" />

          {errors.root?.message && <Alert variant="error">{errors.root.message}</Alert>}

          <p className={style.summary__trust}>
            <HiLockClosed className={style['summary__trust-icon']} />
            Secure checkout
          </p>

          <p className={style.summary__policy}>
            By placing an order, you agree to our{' '}
            <a href="#" className={style.summary__link}>
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className={style.summary__link}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </aside>
  );
};
