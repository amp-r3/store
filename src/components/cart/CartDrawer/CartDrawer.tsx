import { FC, useCallback, useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { useNavigate } from 'react-router';
import { VisuallyHidden } from 'radix-ui'
import { IoWarningOutline } from "react-icons/io5";

import styles from './cart-drawer.module.scss';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { selectCartItems, selectCartTotalQuantity } from '@/store';
import { changeQuantity, clearCart, removeFromCart } from '@/store/slices/cartSlice';
import { calculateCartTotals } from '@/utils';

import { CartItem } from '../CartItem/CartItem';
import { CartFooter } from '../CartFooter/CartFooter';
import { CartHeader } from '../CartHeader/CartHeader';
import { EmptyCart } from '../EmptyCart/EmptyCart';

import { useHaptics } from '@/hooks';
import { Modal } from '@/components/common/Modal/Modal';
import { selectIsAuth } from '@/store/selectors/authSelectors';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_ROOT = document.getElementById('modal-root')!;

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartItems = useAppSelector(selectCartItems);
  const isAuth = useAppSelector(selectIsAuth)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const onIncrease = useCallback((id: number) => { dispatch(changeQuantity({ id, type: 'inc' })); soft(); }, [dispatch, soft]);
  const onDecrease = useCallback((id: number) => { dispatch(changeQuantity({ id, type: 'dec' })); soft(); }, [dispatch, soft]);
  const onRemove = useCallback((id: number) => { dispatch(removeFromCart(id)); medium(); }, [dispatch, medium]);
  const onClearCart = useCallback(() => { dispatch(clearCart()); medium(); }, [dispatch, medium]);

  const handleCheckout = () => {
    success();
    onClose();
    if (!isAuth) setIsModalOpen(true)
  };

  const onStartShopping = () => {
    soft();
    navigate('/', { replace: true });
    onClose();
  };

  return (
    <>

      <Drawer.Root
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        direction="right"
      >
        <Drawer.Portal container={MODAL_ROOT}>
          <Drawer.Overlay className={styles.cart__backdrop} />

          <Drawer.Content
            className={styles.cart}
            aria-describedby={undefined}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
          >
            <VisuallyHidden.Root>
              <Drawer.Title>Shopping Cart</Drawer.Title>
            </VisuallyHidden.Root>

            <div className={styles.cart__header}>
              <CartHeader
                totalQuantity={totalQuantity}
                onClose={onClose}
                onClearCart={cartItems.length > 0 ? onClearCart : undefined}
              />
            </div>

            <div className={styles.cart__scrollArea}>
              <div className={styles.cart__body}>
                {cartItems.length ? (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      product={item}
                      onIncrease={onIncrease}
                      onDecrease={onDecrease}
                      onRemove={onRemove}
                      onClose={onClose}
                    />
                  ))
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
      {
        !isAuth &&
        <Modal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          title="You are not registered"
          description="To continue you need to register"
          icon={<IoWarningOutline size={50} />}
          actionLabel="register"
          onAction={() => { navigate('/register'); setIsModalOpen(false) }}
        />
      }
    </>
  );
};