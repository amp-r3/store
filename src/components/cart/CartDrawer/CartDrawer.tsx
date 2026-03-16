import { FC, useMemo } from 'react';
import { Drawer } from 'vaul';
import { useNavigate } from 'react-router';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import styles from './cart-drawer.module.scss';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { selectCartItems, selectCartTotalQuantity } from '@/store';
import { changeQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { calculateCartTotals } from '@/utils';

import { CartItem } from '../CartItem/CartItem';
import { CartFooter } from '../CartFooter/CartFooter';
import { CartHeader } from '../CartHeader/CartHeader';
import { EmptyCart } from '../EmptyCart/EmptyCart';

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
  const onRemove = (id: number) => { dispatch(removeFromCart(id)); medium(); };

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
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className={styles.cart__backdrop} />

        <Drawer.Content
          className={styles.cart}
          style={{ height: '100%', right: 0, top: 0 }}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          <VisuallyHidden.Root>
            <Drawer.Title>Shopping Cart</Drawer.Title>
          </VisuallyHidden.Root>

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