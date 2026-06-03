import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  HiLocationMarker,
  HiCreditCard,
  HiArrowRight,
  HiCheckCircle,
  HiChevronDown
} from "react-icons/hi";

import { CartItem } from '@/types/products';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { StepType } from '../../CheckoutPage';
import { DeliveryMethod, PaymentMethod } from '@/types/checkout';
import { CheckoutFormValues } from '@/schemas/checkoutMasterSchema';
import { formatPrice } from '@/utils';

import ProductItem from '@/components/products/ProductItem/ProductItem';
import ProductItemSkeleton from '@/components/products/ProductItem/ProductItemSkeleton';
import style from './checkout-summary.module.scss';
import { useCheckoutTotals, useHaptics } from '@/hooks';

interface CheckoutSummaryProps {
  cartItems: CartProduct[];
  cartDetails: CartItem[];
  subtotal: number;
  cartTotal: number;
  discountAmount: number;
  discountPercent: number;
  remainingForFreeShipping: number;
  step: StepType;
  selectedDelivery: DeliveryMethod;
  selectedPayment: PaymentMethod;
  isLastStep: boolean;
  isCreating: boolean;
  isLoading: boolean;
  handleNextStep(): void;
  onSubmit: (formData: CheckoutFormValues) => Promise<void>;
}

export const CheckoutSummary: FC<CheckoutSummaryProps> = ({
  cartDetails,
  cartItems,
  cartTotal,
  subtotal,
  discountAmount,
  discountPercent,
  remainingForFreeShipping,
  step,
  selectedDelivery,
  selectedPayment,
  isLastStep,
  isLoading,
  isCreating,
  handleNextStep,
  onSubmit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { soft } = useHaptics();

  const {
    deliveryCost,
    feePercentage,
    feePercentageAmount,
    feeFixed,
    finalTotalPrice
  } = useCheckoutTotals({
    cartTotal,
    freeShippingThreshold: remainingForFreeShipping <= 0 ? 0 : null,
    selectedDelivery,
    selectedPayment,
  });

  const methods = useFormContext<CheckoutFormValues>();

  const hasDiscount = discountAmount > 0;
  const hasFreeShipping = deliveryCost === 0;
  const almostFreeShipping = remainingForFreeShipping > 0 && selectedDelivery?.code === 'standard';

  const toggleExpanded = () => {
    soft();
    setIsExpanded(!isExpanded);
  };

  const getButtonText = () => {
    switch (step) {
      case 'contacts': return 'Continue to Delivery';
      case 'delivery': return 'Continue to Payment';
      case 'payment': return 'Place Order';
      default: return 'Continue';
    }
  };

  const getButtonIcon = () => {
    switch (step) {
      case 'contacts': return <HiLocationMarker />;
      case 'delivery': return <HiCreditCard />;
      case 'payment': return <HiCheckCircle />;
      default: return null;
    }
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
              <ProductItemSkeleton key={`skeleton-mock-${index}`} />
            ))
            : cartItems.map((item, index) => (
              <ProductItem
                key={item.id}
                product={{ ...cartDetails[index], quantity: item.quantity }}
              />
            ))
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
                <span className={style['total-row__badge']}>{discountPercent}% off</span>
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
                  Add {formatPrice(remainingForFreeShipping)} more for free shipping
                </p>
              )}

              {hasFreeShipping && selectedDelivery?.id.toLowerCase().includes('standard') && (
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

      {/* Footer: Contains final total and CTA, becomes sticky on mobile */}
      <div className={style.summary__footer}>
        <div className={`${style['total-row']} ${style['total-row--final']}`}>
          <span className={style['total-row__label']}>Total</span>
          <span className={style['total-row__value']}>{formatPrice(finalTotalPrice)}</span>
        </div>

        <button
          className={style.summary__cta}
          disabled={isCreating}
          type="button"
          onClick={isLastStep ? methods.handleSubmit(onSubmit) : handleNextStep}
        >
          {isCreating ? 'Loading...' : (
            <>
              {getButtonIcon() && (
                <span className={style.summary__cta__icon_step}>
                  {getButtonIcon()}
                </span>
              )}
              <span className={style.summary__cta__label}>
                {getButtonText()}
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