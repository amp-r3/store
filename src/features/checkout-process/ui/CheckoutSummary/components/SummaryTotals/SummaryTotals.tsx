import { remainingForFreeDelivery, isDeliveryFree } from '@/entities/order';
import { useCheckoutContext } from '../../../../model/CheckoutContext';
import { formatPrice } from '@/shared/lib';
import { SummaryTotalRow, SummaryTotalBadge } from '../SummaryTotalRow/SummaryTotalRow';
import style from './summary-totals.module.scss';

export const SummaryTotals = () => {
  const { totals, orderTotals, selectedDelivery, selectedPayment } = useCheckoutContext();
  const { subtotal, discountAmount, discountPercent, total: cartTotal } = totals;
  const { deliveryCost, feePercentage, feePercentageAmount, feeFixed } = orderTotals;

  const hasDiscount = discountAmount > 0;
  const hasFreeShipping = deliveryCost === 0;
  const remainingForDeliveryFree = remainingForFreeDelivery(selectedDelivery, cartTotal);
  const almostFreeShipping = remainingForDeliveryFree > 0;

  return (
    <div className={style.totals}>
      <SummaryTotalRow label="Subtotal" value={formatPrice(subtotal)} />

      {hasDiscount && (
        <SummaryTotalRow
          label={
            <>
              Discount{' '}
              <SummaryTotalBadge variant="discount">{discountPercent}% off</SummaryTotalBadge>
            </>
          }
          value={`− ${formatPrice(discountAmount)}`}
          valueVariant="discount"
        />
      )}

      {!!selectedDelivery && (
        <>
          <SummaryTotalRow
            label="Delivery"
            value={hasFreeShipping ? 'Free' : `+ ${formatPrice(deliveryCost)}`}
            valueVariant={hasFreeShipping ? 'free' : undefined}
          />

          {almostFreeShipping && (
            <p className={style['shipping-hint']}>
              Add {formatPrice(remainingForDeliveryFree)} more for free shipping
            </p>
          )}

          {hasFreeShipping && isDeliveryFree(selectedDelivery, cartTotal) && (
            <p className={`${style['shipping-hint']} ${style['shipping-hint--active']}`}>
              ✓ Free shipping applied
            </p>
          )}
        </>
      )}

      {!!selectedPayment && (
        <>
          {feePercentage > 0 && (
            <SummaryTotalRow
              label={
                <>
                  Payment fee <SummaryTotalBadge>{feePercentage}%</SummaryTotalBadge>
                </>
              }
              value={`+ ${formatPrice(feePercentageAmount)}`}
              valueVariant="fee"
            />
          )}

          {feeFixed > 0 && (
            <SummaryTotalRow
              label="Fixed fee"
              value={`+ ${formatPrice(feeFixed)}`}
              valueVariant="fee"
            />
          )}

          {feePercentage === 0 && feeFixed === 0 && (
            <SummaryTotalRow label="Payment fee" value="Free" valueVariant="free" />
          )}
        </>
      )}

      <div className={style.divider} role="presentation" />

      <SummaryTotalRow isFinal label="Total" value={formatPrice(orderTotals.finalTotalPrice)} />
    </div>
  );
};
