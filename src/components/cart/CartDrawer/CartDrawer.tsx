// React
import { FC, useEffect, useMemo } from 'react';
// Icons
import { IoClose, IoBagHandleOutline } from 'react-icons/io5';
// Styles
import styles from './cart-drawer.module.scss';
// Redux Typed Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// Selectors
import { selectCartItems, selectCartTotalQuantity } from '@/store';
// Functions
import { changeQuantity, removeFromCart } from '@/store/slices/cartSlice';
// Custom components
import { CartItem } from '../CartItem/CartItem';
import { CartFooter } from '../CartFooter/CartFooter';
// Utils
import { calculateCartTotals } from '@/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartItems = useAppSelector(selectCartItems);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const dispatch = useAppDispatch();

  const {
    subtotal,
    total,
    discountAmount,
    discountPercent,
    shippingProgress,
    remainingForFreeShipping
  } = useMemo(() => calculateCartTotals(cartItems), [cartItems]);

  const onIncrease = (id: number) => dispatch(changeQuantity({ id, type: 'inc' }));
  const onDecrease = (id: number) => dispatch(changeQuantity({ id, type: 'dec' }));
  const onRemove = (id: number) => dispatch(removeFromCart(id));

  const handleCheckout = () => {
    console.log('Proceed to checkout');
  };


  // Block body scrolling when the cart is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Escape Closing
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const drawerClasses = `${styles.cart} ${isOpen ? styles['cart--open'] : ''}`;
  const backdropClasses = `${styles.cart__backdrop} ${isOpen ? styles['cart__backdrop--visible'] : ''}`;

  return (
    <>
      <div className={backdropClasses} onClick={onClose} aria-hidden="true" />

      <aside onClick={(e) => e.stopPropagation()} className={drawerClasses} aria-modal="true" role="dialog">

        {/* --- HEADER --- */}
        <header className={styles.cart__header}>
          <div className={styles.cart__headerContent}>
            <h2 className={styles.cart__title}>
              Cart <span className={styles.cart__count}>{totalQuantity}</span>
            </h2>
            <button className={styles.cart__closeBtn} onClick={onClose} aria-label="Close">
              <IoClose size={24} />
            </button>
          </div>
        </header>

        {/* --- BODY --- */}
        <div className={styles.cart__body}>
          {cartItems.length ? (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                product={item}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))
          ) : (
            <div className={styles.cart__emptyState}>
              <IoBagHandleOutline size={48} className={styles.cart__emptyIcon} />
              <p>Your cart is currently empty</p>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        {cartItems.length > 0 && (
          <CartFooter
            subtotal={subtotal}
            total={total}
            discountAmount={discountAmount}
            discountPercent={discountPercent}
            shippingProgress={shippingProgress}
            remainingForFreeShipping={remainingForFreeShipping}
            onCheckout={handleCheckout}
          />
        )}
      </aside>
    </>
  );
};