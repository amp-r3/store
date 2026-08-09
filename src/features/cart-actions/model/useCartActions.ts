// useCartActions.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/model";
import { selectIsAuth } from "@/entities/session";
import { useUpsertCartItemMutation, useDeleteCartItemMutation, useClearCartMutation, changeQuantity, removeFromCart, clearCart, openCart } from "@/entities/cart";
import { showToast } from "@/shared/ui";

// Mirrors the aggregate threshold in ProductStockBadge ("There are a few
// left" at <= 10), applied here to the single size being added to the cart.
const LOW_STOCK_THRESHOLD = 10;

interface UseCartActionsReturn {
  onIncrease(sizeId: number, productId: number, stock?: number): void;
  onDecrease(sizeId: number, productId: number): void;
  onRemove(sizeId: number): void;
  onClearCart(): void;
  isUpdating: boolean;
}

export const useCartActions = (): UseCartActionsReturn => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);

  const [upsertItem, { isLoading: isUpserting }] = useUpsertCartItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteCartItemMutation();
  const [clearServerCart, { isLoading: isClearing }] = useClearCartMutation();

  const isUpdating = isUpserting || isDeleting || isClearing;

  const onIncrease = useCallback((sizeId: number, productId: number, stock?: number) => {
    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'inc' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'inc' }));
    }

    const viewCartAction = { label: 'View', onClick: () => dispatch(openCart()) };

    if (stock !== undefined && stock <= LOW_STOCK_THRESHOLD) {
      showToast('warning', `Only ${stock} left in stock`, { key: 'cart', action: viewCartAction });
    } else {
      showToast('added', 'Added to cart', { key: 'cart', action: viewCartAction });
    }
  }, [isAuth, upsertItem, dispatch])

  const onDecrease = useCallback((sizeId: number, productId: number) => {
    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'dec' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'dec' }));
    }
    // Undo is UI only for now — it dismisses the toast, it does not restore the item.
    showToast('removed', 'Removed from cart', { key: 'cart', action: { label: 'Undo', emphasis: 'ghost' } });
  }, [isAuth, upsertItem, dispatch]);

  const onRemove = useCallback((sizeId: number) => {
    if (isAuth) {
      deleteItem(sizeId);
    } else {
      dispatch(removeFromCart(sizeId));
    }
    // Undo is UI only for now — it dismisses the toast, it does not restore the item.
    showToast('removed', 'Removed from cart', { key: 'cart', action: { label: 'Undo', emphasis: 'ghost' } });
  }, [isAuth, deleteItem, dispatch]);

  const onClearCart = useCallback(() => {
    if (isAuth) {
      clearServerCart();
    } else {
      dispatch(clearCart());
    }
    // Undo is UI only for now — it dismisses the toast, it does not restore the cart.
    showToast('removed', 'Cart cleared', { key: 'cart', action: { label: 'Undo', emphasis: 'ghost' } });
  }, [isAuth, clearServerCart, dispatch]);

  return { onIncrease, onDecrease, onRemove, onClearCart, isUpdating };
};