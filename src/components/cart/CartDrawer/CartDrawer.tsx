import { FC, useMemo } from 'react';
import { Drawer } from 'vaul';
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
// Custom Hooks
import { useHaptics } from '@/hooks';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartItems = useAppSelector(selectCartItems);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { soft, medium, success } = useHaptics();

  const {
    subtotal,
    total,
    discountAmount,
    discountPercent,
    shippingProgress,
    remainingForFreeShipping,
  } = useMemo(() => calculateCartTotals(cartItems), [cartItems]);

  const onIncrease = (id: number) => { dispatch(changeQuantity({ id, type: 'inc' })); soft(); };
  const onDecrease = (id: number) => { dispatch(changeQuantity({ id, type: 'dec' })); soft(); };
  const onRemove   = (id: number) => { dispatch(removeFromCart(id)); medium(); };

  const handleCheckout = () => {
    success();
    console.log('Proceed to checkout');
  };

  const onStartShopping = () => {
    soft();
    navigate('/', { replace: true });
    onClose();
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <Drawer.Portal>
        {/* Backdrop */}
        <Drawer.Overlay className={styles.cart__backdrop} />

        {/* Drawer panel */}
        <Drawer.Content
          className={styles.cart}
          aria-labelledby="cart-title"
        >
          {/* --- SCROLLABLE AREA (Header + Body) --- */}
          <div className={styles.cart__scrollArea}>
            <CartHeader totalQuantity={totalQuantity} onClose={onClose} />

            <div className={styles.cart__body}>
              {cartItems.length ? (
                cartItems.map((item) => {
                  const isMaxValue = item.quantity >= item.stock;
                  return (
                    <CartItem
                      key={item.id}
                      product={item}
                      onIncrease={onIncrease}
                      onDecrease={onDecrease}
                      onRemove={onRemove}
                      isMaxValue={isMaxValue}
                    />
                  );
                })
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};