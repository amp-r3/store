import { useCheckoutContext } from '../../../../model/CheckoutContext';
import { CartItem, CartItemSkeleton } from '@/entities/cart';
import style from './summary-items.module.scss';

export const SummaryItems = () => {
  const { checkoutItems, checkoutDetails, isLoading } = useCheckoutContext();

  return (
    <div className={style.wrapper}>
      <div className={style.items} aria-live="polite">
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
              );
            })}
      </div>
      <div className={style.fade} aria-hidden="true" />
    </div>
  );
};
