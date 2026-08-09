import { FC, useState } from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from 'radix-ui'
import { IoWarningOutline } from "react-icons/io5";

import styles from './cart-drawer.module.scss';
import { Modal } from '@/shared/ui';
import { selectIsAuth } from '@/entities/session';
import { addToCheckout } from '@/features/checkout-process';
import { useHaptics, useTransitionRouter } from "@/shared/lib/hooks";
import { getModalRoot, ignoreToastInteraction } from "@/shared/lib";
import { useAppDispatch } from "@/shared/model";
import { useAppSelector } from "@/shared/model";
import { useCartActions } from "@/features/cart-actions";
import { useCartDetails } from "@/entities/cart";
import { CartItem } from "@/entities/cart";
import { CartItemSkeleton } from "@/entities/cart";
import { CartFooter } from "@/entities/cart";
import { CartHeader } from "@/entities/cart";
import { EmptyCart } from "@/entities/cart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartDetails, isEmpty, totals, isLoading, isFetching, cartItems, totalQuantity, refetchCart } = useCartDetails(isOpen);
  const isAuth = useAppSelector(selectIsAuth)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useTransitionRouter();
  const { soft } = useHaptics();
  const dispatch = useAppDispatch()
  const modalRoot = getModalRoot();

  const { onIncrease, onDecrease, onRemove, onClearCart, isUpdating } = useCartActions()

  const handleCheckout = async () => {
    try {
      if (isAuth) {
        refetchCart();
      }

    } catch (error) {
      console.error("Error reconciling cart:", error);
    }
    dispatch(addToCheckout(cartItems))
    router.push('/checkout');
    onClose();
  };

  const onStartShopping = () => {
    soft();
    router.replace('/');
    onClose();
  };


  return (
    <>

      <Drawer.Root
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        direction="right"
      >
        <Drawer.Portal container={modalRoot}>
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
            onPointerDownOutside={ignoreToastInteraction}
          >
            <VisuallyHidden.Root>
              <Drawer.Title>Shopping Cart</Drawer.Title>
            </VisuallyHidden.Root>

            <div className={styles.cart__header}>
              <CartHeader
                totalQuantity={totalQuantity || 0}
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
                      <CartItemSkeleton key={`skeleton-${item.sizeId}`} />
                    ))

                ) : isEmpty ? (
                  <EmptyCart onStartShopping={onStartShopping} />

                ) : (
                  cartItems.map((item, index) => {
                    const productDetails = cartDetails[index];
                    if (!productDetails) return null;

                    return (
                      <CartItem
                        key={item.sizeId}
                        product={productDetails}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                        onRemove={onRemove}
                        onClose={onClose}
                      />
                    );
                  })
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
          onAction={() => { router.push('/register'); setIsModalOpen(false) }}
        />
      }
    </>
  );
};