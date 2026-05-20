import ProductItem from '@/components/products/ProductItem/ProductItem';
import style from './checkout-summary.module.scss';
import { CartItem } from '@/types/products';
import { FC } from 'react';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { DeliveryOption, StepType } from '../../CheckoutPage';
import { formatPrice } from '@/utils';
import {
  HiLocationMarker,
  HiCreditCard,
  HiArrowRight,
  HiCheckCircle
} from "react-icons/hi";

interface CheckoutSummaryProps {
  cartItems: CartProduct[];
  cartDetails: CartItem[];
  deliveryCost: number;
  subtotal: number;
  total: number;
  discountAmount: number;
  discountPercent: number;
  shippingProgress: number;
  remainingForFreeShipping: number;
  step: StepType;
  selectedDelivery: DeliveryOption;
  isLastStep: boolean
  handleNextStep(): void;
}

export const CheckoutSummary: FC<CheckoutSummaryProps> = ({
  cartDetails,
  cartItems,
  deliveryCost,
  subtotal,
  total,
  discountAmount,
  discountPercent,
  remainingForFreeShipping,
  step,
  selectedDelivery,
  isLastStep,
  handleNextStep,
}) => {
  const hasDiscount = discountAmount > 0;
  const hasFreeShipping = deliveryCost === 0;
  const almostFreeShipping = remainingForFreeShipping > 0 && selectedDelivery.id === 'standard';

  const getButtonText = () => {
    switch (step) {
      case 'contacts':
        return 'Continue to Delivery';
      case 'delivery':
        return 'Continue to Payment';
      case 'payment':
        return 'Place Order';
      default:
        return 'Continue';
    }
  };

  const getButtonIcon = () => {
    switch (step) {
      case 'contacts':
        return <HiLocationMarker />;
      case 'delivery':
        return <HiCreditCard />;
      case 'payment':
        return <HiCheckCircle />;
      default:
        return null;
    }
  };

  return (
    <aside className={style.summary}>
      <h2 className={style.summary__title}>Order Summary</h2>

      <div className={style.summary__items}>
        {cartItems.map((item, index) => (
          <ProductItem
            key={item.id}
            product={{ ...cartDetails[index], quantity: item.quantity }}
          />
        ))}
      </div>

      <div className={style.summary__divider} />

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

        <div className={style['total-row']}>
          <span className={style['total-row__label']}>Delivery</span>
          <span className={`${style['total-row__value']} ${hasFreeShipping ? style['total-row__value--free'] : ''}`}>
            {hasFreeShipping ? 'Free' : formatPrice(deliveryCost)}
          </span>
        </div>

        {almostFreeShipping && (
          <p className={style['summary__shipping-hint']}>
            Add {formatPrice(remainingForFreeShipping)} more for free shipping
          </p>
        )}

        {hasFreeShipping && selectedDelivery.id === 'standard' && (
          <p className={`${style['summary__shipping-hint']} ${style['summary__shipping-hint--active']}`}>
            ✓ Free shipping applied
          </p>
        )}
      </div>

      <div className={style.summary__divider} />

      <div className={`${style['total-row']} ${style['total-row--final']}`}>
        <span className={style['total-row__label']}>Total</span>
        <span className={style['total-row__value']}>{formatPrice(total)}</span>
      </div>

      <button
        className={style.summary__cta}
        form='checkout-form'
        type={isLastStep ? 'submit' : 'button'}
        onClick={isLastStep ? undefined : handleNextStep}
      >
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
      </button>

      <p className={style.summary__policy}>
        By placing an order, you agree to our{' '}
        <a href="#" className={style.summary__link}>Terms</a> and{' '}
        <a href="#" className={style.summary__link}>Privacy Policy</a>.
      </p>
    </aside>
  );
};