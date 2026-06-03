import { FC, useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { useNavigate } from 'react-router';
import { VisuallyHidden } from 'radix-ui'
import { IoWarningOutline } from "react-icons/io5";

import styles from './cart-drawer.module.scss';

import { useAppDispatch, useAppSelector } from '@/hooks';

import { CartItem } from '../CartItem/CartItem';
import { CartItemSkeleton } from '../CartItem/CartItemSkeleton';
import { CartFooter } from '../CartFooter/CartFooter';
import { CartHeader } from '../CartHeader/CartHeader';
import { EmptyCart } from '../EmptyCart/EmptyCart';
import { Modal } from '@/components/common';

import { useCartActions, useCartDetails, useHaptics } from '@/hooks';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { addToCheckout } from '@/store/slices/checkoutSlice';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_ROOT = document.getElementById('modal-root')!;

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartDetails, isEmpty, totals, isLoading, isFetching, cartItems, totalQuantity, refetchCart } = useCartDetails(isOpen);
  const isAuth = useAppSelector(selectIsAuth)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate();
  const { soft, success } = useHaptics();
  const dispatch = useAppDispatch()

  const { onIncrease, onDecrease, onRemove, onClearCart, isUpdating } = useCartActions()

  const handleCheckout = async () => {
    try {
      if (isAuth) {
        await refetchCart().unwrap();
      }

    } catch (error) {
      console.error("Error reconciling cart:", error);
    }
    dispatch(addToCheckout(cartItems))
    navigate('/checkout');
    onClose();
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
                onClearCart={isEmpty ? undefined : onClearCart}
              />
            </div>

            <div className={styles.cart__scrollArea}>
              <div className={styles.cart__body}>

                {isLoading || isFetching ? (
                  isEmpty
                    ?
                    Array.from({ length: 4 }).map((_, index) => (
                      <CartItemSkeleton key={`skeleton-mock-${index}`} />
                    ))
                    :
                    cartItems.map((item) => (
                      <CartItemSkeleton key={`skeleton-${item.id}`} />
                    ))

                ) : isEmpty ? (
                  <EmptyCart onStartShopping={onStartShopping} />

                ) : (
                  cartItems.map((item, index) => (
                    <CartItem
                      key={item.id}
                      product={cartDetails[index]}
                      onIncrease={onIncrease}
                      onDecrease={onDecrease}
                      onRemove={onRemove}
                      onClose={onClose}
                    />
                  ))
                )}

              </div>
            </div>

            {!isEmpty && (
              <CartFooter
                subtotal={totals.subtotal}
                total={totals.total}
                discountAmount={totals.discountAmount}
                discountPercent={totals.discountPercent}
                shippingProgress={totals.shippingProgress}
                remainingForFreeShipping={totals.remainingForFreeShipping}
                isLoading={isLoading}
                isFetching={isFetching}
                isUpdating={isUpdating}
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