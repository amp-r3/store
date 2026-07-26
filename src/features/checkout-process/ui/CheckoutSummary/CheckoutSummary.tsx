import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { HiArrowRight, HiChevronDown, HiExclamationCircle } from "react-icons/hi";
import { remainingForFreeDelivery } from '@/entities/order';
import { CheckoutFormValues } from '@/features/checkout-process/model/checkoutMasterSchema';
import { CHECKOUT_STEPS } from '@/features/checkout-process/model/checkoutConfig';
import { useCheckoutContext } from '@/features/checkout-process/model/CheckoutContext';
import style from './checkout-summary.module.scss';
import { formatPrice } from "@/shared/lib";
import { useHaptics } from "@/shared/lib/hooks";
import { CartItem, CartItemSkeleton } from "@/entities/cart";

export const CheckoutSummary = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { soft } = useHaptics();

  const {
    checkoutItems,
    checkoutDetails,
    totals,
    orderTotals,
    selectedDelivery,
    selectedPayment,
    step,
    isLastStep,
    isLoading,
    isSubmitting,
    goNext,
  } = useCheckoutContext();

  const { subtotal, discountAmount, discountPercent, total: cartTotal } = totals;
  const { deliveryCost, feePercentage, feePercentageAmount, feeFixed, finalTotalPrice } = orderTotals;

  const { formState: { errors } } = useFormContext<CheckoutFormValues>();

  const hasDiscount = discountAmount > 0;
  const hasFreeShipping = deliveryCost === 0;
  const remainingForDeliveryFree = remainingForFreeDelivery(selectedDelivery, cartTotal);
  const almostFreeShipping = remainingForDeliveryFree > 0;

  const toggleExpanded = () => {
    soft();
    setIsExpanded(!isExpanded);
  };

  const { cta, ctaIcon } = CHECKOUT_STEPS[step];

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
          <span className={style.summary__mobile_header_total}>{formatPrice(finalTotalPrice)}</span>
        </div>
        <HiChevronDown className={`${style.summary__mobile_toggle} ${isExpanded ? style['summary__mobile_toggle--active'] : ''}`} />
      </button>

      {/* Collapsible Content */}
      <div className={`${style.summary__collapsible} ${isExpanded ? style['summary__collapsible--expanded'] : ''}`}>
        <h2 className={style.summary__title}>Order Summary</h2>

        <div className={style.summary__items} aria-live="polite">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
              <CartItemSkeleton key={`skeleton-mock-${index}`} />
            ))
            : checkoutItems.map((item, index) => {
              const details = checkoutDetails[index];
              if (!details) return null;
              return (
              <CartItem
                key={`${item.productId} ${item.sizeId}`}
                product={{ ...details, quantity: item.quantity, sizeId: item.sizeId }}
                readonly
              />
            )})
          }
        </div>

        <div className={style.summary__divider} role="presentation" />

        <div className={style.summary__totals}>
          <div className={style['total-row']}>
            <span className={style['total-row__label']}>Subtotal</span>
            <span className={style['total-row__value']}>{formatPrice(subtotal)}</span>
          </div>

          {hasDiscount && (
            <div className={style['total-row']}>
              <span className={style['total-row__label']}>
                Discount
                <span className={`${style['total-row__badge']} ${style['total-row__badge--discount']}`}>{discountPercent}% off</span>
              </span>
              <span className={`${style['total-row__value']} ${style['total-row__value--discount']}`}>
                − {formatPrice(discountAmount)}
              </span>
            </div>
          )}

          {!!selectedDelivery && (
            <>
              <div className={style['total-row']}>
                <span className={style['total-row__label']}>Delivery</span>
                <span className={`${style['total-row__value']} ${hasFreeShipping ? style['total-row__value--free'] : ''}`}>
                  {hasFreeShipping ? 'Free' : `+ ${formatPrice(deliveryCost)}`}
                </span>
              </div>

              {almostFreeShipping && (
                <p className={style['summary__shipping-hint']}>
                  Add {formatPrice(remainingForDeliveryFree)} more for free shipping
                </p>
              )}

              {hasFreeShipping && selectedDelivery?.code === 'standard' && (
                <p className={`${style['summary__shipping-hint']} ${style['summary__shipping-hint--active']}`}>
                  ✓ Free shipping applied
                </p>
              )}
            </>
          )}

          {!!selectedPayment && (
            <>
              {feePercentage > 0 && (
                <div className={style['total-row']}>
                  <span className={style['total-row__label']}>
                    Payment fee
                    <span className={style['total-row__badge']}>{feePercentage}%</span>
                  </span>
                  <span className={`${style['total-row__value']} ${style['total-row__value--fee']}`}>
                    + {formatPrice(feePercentageAmount)}
                  </span>
                </div>
              )}

              {feeFixed > 0 && (
                <div className={style['total-row']}>
                  <span className={style['total-row__label']}>Fixed fee</span>
                  <span className={`${style['total-row__value']} ${style['total-row__value--fee']}`}>
                    + {formatPrice(feeFixed)}
                  </span>
                </div>
              )}

              {feePercentage === 0 && feeFixed === 0 && (
                <div className={style['total-row']}>
                  <span className={style['total-row__label']}>Payment fee</span>
                  <span className={`${style['total-row__value']} ${style['total-row__value--free']}`}>
                    Free
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={style.summary__divider} role="presentation" />

        <p className={style.summary__policy}>
          By placing an order, you agree to our{' '}
          <a href="#" className={style.summary__link}>Terms</a> and{' '}
          <a href="#" className={style.summary__link}>Privacy Policy</a>.
        </p>
      </div>

      {errors.root?.message && (
        <div className={style.summary__error} role="alert">
          <HiExclamationCircle className={style['summary__error-icon']} />
          <span className={style['summary__error-text']}>{errors.root.message}</span>
        </div>
      )}

      {/* Footer: Contains final total and CTA, becomes sticky on mobile */}
      <div className={style.summary__footer}>
        <div className={`${style['total-row']} ${style['total-row--final']}`}>
          <span className={style['total-row__label']}>Total</span>
          <span className={style['total-row__value']}>{formatPrice(finalTotalPrice)}</span>
        </div>

        <button
          className={style.summary__cta}
          disabled={isSubmitting}
          type={isLastStep ? 'submit' : 'button'}
          form={isLastStep ? 'checkout-form' : undefined}
          onClick={isLastStep ? undefined : goNext}
        >
          {isSubmitting ? 'Loading...' : (
            <>
              <span className={style.summary__cta__icon_step}>
                {ctaIcon}
              </span>
              <span className={style.summary__cta__label}>
                {cta}
              </span>
              <span className={style.summary__cta__icon_arrow}>
                <HiArrowRight />
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
