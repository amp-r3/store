import { FC, ReactNode } from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from 'radix-ui';
import { IoTrashOutline } from 'react-icons/io5';

import styles from './cart-drawer.module.scss';
import { Alert, ErrorView } from '@/shared/ui';
import { selectIsAuth } from '@/entities/session';
import { addToCheckout } from '@/features/checkout-process';
import { useHaptics, useTransitionRouter } from '@/shared/lib/hooks';
import { getModalRoot, ignoreToastInteraction } from '@/shared/lib';
import { useAppDispatch } from '@/shared/model';
import { useAppSelector } from '@/shared/model';
import { useCartActions } from '@/features/cart-actions';
import { useCartDetails } from '@/entities/cart';
import { CartData } from '@/entities/cart';
import { CartItem } from '@/entities/cart';
import { CartItemSkeleton } from '@/entities/cart';
import { CartFooter } from '@/entities/cart';
import { CartHeader } from '@/entities/cart';
import { EmptyCart } from '@/entities/cart';
import { CartUndoStrip } from '@/entities/cart';
import { CART_UNDO_DURATION_MS, RemovedEntry, useCartRemovalUndo } from './useCartRemovalUndo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cartDetails,
    isEmpty,
    isError,
    totals,
    isLoading,
    isFetching,
    cartItems,
    totalQuantity,
    refetchCart,
  } = useCartDetails(isOpen);
  const isAuth = useAppSelector(selectIsAuth);
  const router = useTransitionRouter();
  const { soft } = useHaptics();
  const dispatch = useAppDispatch();
  const modalRoot = getModalRoot();

  const removalUndo = useCartRemovalUndo({ cartItems, cartDetails, isOpen });
  const {
    onIncrease,
    onDecrease,
    onRemove,
    onClearCart,
    onRestoreItem,
    onRestoreCart,
    isUpdating,
  } = useCartActions({
    onRemoved: removalUndo.handleRemoved,
    onCleared: removalUndo.handleCleared,
  });

  const handleUndoItem = (entry: RemovedEntry) => {
    soft();
    removalUndo.dismissRemoval(entry.sizeId);
    onRestoreItem(entry.sizeId, entry.productId, entry.quantity);
  };

  const handleUndoClear = () => {
    if (!removalUndo.clearedEntry) return;
    soft();
    const { snapshot } = removalUndo.clearedEntry;
    removalUndo.dismissCleared();
    onRestoreCart(snapshot);
  };

  const handleCheckout = async () => {
    let itemsForCheckout = cartItems;

    if (isAuth) {
      try {
        const freshCart = await refetchCart().unwrap();
        itemsForCheckout = (Object.entries(freshCart) as [string, CartData][]).map(
          ([sizeId, info]) => ({
            sizeId: Number(sizeId),
            productId: info.productId,
            quantity: info.quantity,
          }),
        );
      } catch (error) {
        console.error('Error reconciling cart:', error);
      }
    }

    dispatch(addToCheckout(itemsForCheckout));
    router.push('/checkout');
    onClose();
  };

  const onStartShopping = () => {
    soft();
    router.replace('/');
    onClose();
  };

  const showSkeleton = isLoading || isFetching;

  // A removed sizeId can reappear in cartItems if the user re-adds it while
  // its undo window is still open — drop the stale strip rather than
  // showing two conflicting rows for the same line.
  const pendingRemovals = removalUndo.removedEntries.filter(
    (entry) => !cartItems.some((item) => item.sizeId === entry.sizeId),
  );

  const showEmptyState = isEmpty && !showSkeleton && pendingRemovals.length === 0;
  const showErrorState = isError && showEmptyState;

  let cartRows: ReactNode[];

  if (showSkeleton && isEmpty) {
    cartRows = Array.from({ length: 4 }).map((_, index) => (
      <CartItemSkeleton key={`skeleton-mock-${index}`} />
    ));
  } else {
    const liveRows: ReactNode[] = showSkeleton
      ? cartItems.map((item) => <CartItemSkeleton key={`skeleton-${item.sizeId}`} />)
      : cartItems.reduce<ReactNode[]>((acc, item, index) => {
          const productDetails = cartDetails[index];
          if (!productDetails) {
            acc.push(
              <div key={item.sizeId} className={styles.cart__unavailable}>
                <Alert variant="warning">This product is no longer available.</Alert>
                <button
                  type="button"
                  className={styles['cart__unavailable-remove']}
                  onClick={() => onRemove(item.sizeId, item.productId, item.quantity)}
                  aria-label="Remove unavailable item"
                >
                  <IoTrashOutline size={18} aria-hidden="true" />
                  Remove
                </button>
              </div>,
            );
            return acc;
          }

          acc.push(
            <CartItem
              key={item.sizeId}
              product={productDetails}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
              onClose={onClose}
            />,
          );
          return acc;
        }, []);

    // Splice each removed row's strip back into the position it occupied
    // right before removal, so the list doesn't visually reshuffle.
    cartRows = [...liveRows];
    [...pendingRemovals]
      .sort((a, b) => a.index - b.index)
      .forEach((entry) => {
        cartRows.splice(
          Math.min(entry.index, cartRows.length),
          0,
          <CartUndoStrip
            key={`removed-${entry.sizeId}`}
            message={`"${entry.title}" removed`}
            actionLabel="Undo"
            durationMs={CART_UNDO_DURATION_MS}
            onAction={() => handleUndoItem(entry)}
          />,
        );
      });
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
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
              {removalUndo.clearedEntry && (
                <CartUndoStrip
                  message={`Cart cleared · ${removalUndo.clearedEntry.count} item${removalUndo.clearedEntry.count === 1 ? '' : 's'}`}
                  actionLabel="Restore"
                  durationMs={CART_UNDO_DURATION_MS}
                  onAction={handleUndoClear}
                />
              )}

              {showErrorState ? (
                <ErrorView error="We couldn't load your cart. Please try again." />
              ) : showEmptyState ? (
                <EmptyCart onStartShopping={onStartShopping} />
              ) : (
                cartRows
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
  );
};
