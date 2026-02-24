import { FC, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';

// Styles
import styles from './cart-drawer.module.scss';

// Redux Typed Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

// Selectors
import { selectCartItems, selectCartTotalQuantity } from '@/store';

// Functions
import { changeQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { calculateCartTotals } from '@/utils';

// Custom components
import { CartItem } from '../CartItem/CartItem';
import { CartFooter } from '../CartFooter/CartFooter';
import { CartHeader } from '../CartHeader/CartHeader';
import { EmptyCart } from '../EmptyCart/EmptyCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartItems = useAppSelector(selectCartItems);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const drawerRef = useRef<HTMLElement>(null);

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

  const onStartShopping = () => {
    navigate('/', { replace: true });
    onClose();
  };

  // Block body scrolling & Manage Focus Trap
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      drawerRef.current?.focus();
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

  return createPortal(
    <>
      <div className={backdropClasses} onClick={onClose} aria-hidden="true" />

      <aside
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className={drawerClasses}
        aria-modal="true"
        role="dialog"
        aria-labelledby="cart-title"
        tabIndex={-1}
      >
        {/* --- SCROLLABLE AREA (Header + Body) --- */}
        <div className={styles.cart__scrollArea}>
          <CartHeader totalQuantity={totalQuantity} onClose={onClose} />

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
              <EmptyCart onStartShopping={onStartShopping} />
            )}
          </div>
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
    </>,
    document.body
  );
};