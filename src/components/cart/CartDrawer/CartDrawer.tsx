// React
import { FC, useEffect } from 'react';
// Icons
import { IoClose, IoArrowForward, IoBagHandleOutline } from 'react-icons/io5';
// Styles
import styles from './cart-drawer.module.scss';
// Redux Typed Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// Selectors
import { selectCartItems, selectCartTotal, selectCartTotalQuantity } from '@/store';
// Functions
import { changeQuantity, removeFromCart } from '@/store/slices/cartSlice';
// Custom components
import { CartItem } from '../CartItem/CartItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartItems = useAppSelector(selectCartItems)
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const totalCost = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();

  const onIncrease = (id: number) => {
    const type = 'inc'
    dispatch(changeQuantity({ id, type }))
  }

  const onDecrease = (id: number) => {
    const type = 'dec'
    dispatch(changeQuantity({ id, type }))
  }

  const onRemove = (id: number) => {
    dispatch(removeFromCart(id))
  }

  const showDiscountedPrice = () => {
    if (totalCost < 100) {
      return totalCost + ',00'
    } else {
      return totalCost
    }
  }

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
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);



  // Combine classes for open state
  const drawerClasses = `${styles.cart} ${isOpen ? styles['cart--open'] : ''}`;
  const backdropClasses = `${styles.cart__backdrop} ${isOpen ? styles['cart__backdrop--visible'] : ''}`;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={backdropClasses}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart Drawer Container */}
      <aside onClick={(e) => e.stopPropagation()} className={drawerClasses} aria-modal="true" role="dialog">

        {/* --- HEADER --- */}
        <header className={styles.cart__header}>
          <div className={styles.cart__headerContent}>
            <h2 className={styles.cart__title}>
              Your Cart
              <span className={styles.cart__count}>{totalQuantity}</span>
            </h2>

            <button
              className={styles.cart__closeBtn}
              onClick={onClose}
              aria-label="Close cart"
            >
              <IoClose size={24} />
            </button>
          </div>
        </header>

        {/* --- BODY (Scrollable area) --- */}
        <div className={styles.cart__body}>
          {
            cartItems.length ?
              cartItems.map((item) => (<CartItem key={item.id} product={item} onIncrease={onIncrease} onDecrease={onDecrease} onRemove={onRemove} />))
              :
              <div className={styles.cart__emptyState}>
                <IoBagHandleOutline size={48} className={styles.cart__emptyIcon} />
                <p>Your cart is currently empty</p>
              </div>
          }
        </div>

        {/* --- FOOTER (Sticky bottom) --- */}
        <footer className={styles.cart__footer}>
          {/* Summary Block */}
          <div className={styles.cart__summary}>
            <div className={styles.cart__row}>
              <span className={styles.cart__label}>Total:</span>
              <span className={styles.cart__total}>${showDiscountedPrice()}</span>
            </div>
            <p className={styles.cart__note}>Shipping calculated at checkout</p>
          </div>

          {/* Checkout Action */}
          <button className={styles.cart__checkoutBtn}>
            Proceed to Checkout
            <IoArrowForward size={20} />
          </button>
        </footer>

      </aside>
    </>
  );
};