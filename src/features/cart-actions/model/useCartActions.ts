// useCartActions.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/model";
import { selectIsAuth } from "@/entities/session";
import { useUpsertCartItemMutation, useDeleteCartItemMutation, useClearCartMutation, changeQuantity, removeFromCart, clearCart } from "@/entities/cart";
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

    if (stock !== undefined && stock <= LOW_STOCK_THRESHOLD) {
      showToast('warning', `Only ${stock} left in stock`, { key: 'cart' });
    } else {
      showToast('success', 'Added to cart', { key: 'cart' });
    }
  }, [isAuth, upsertItem, dispatch])

  const onDecrease = useCallback((sizeId: number, productId: number) => {
    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'dec' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'dec' }));
    }
    showToast('info', 'Removed from cart', { key: 'cart' });
  }, [isAuth, upsertItem, dispatch]);

  const onRemove = useCallback((sizeId: number) => {
    if (isAuth) {
      deleteItem(sizeId);
    } else {
      dispatch(removeFromCart(sizeId));
    }
    showToast('info', 'Removed from cart', { key: 'cart' });
  }, [isAuth, deleteItem, dispatch]);

  const onClearCart = useCallback(() => {
    if (isAuth) {
      clearServerCart();
    } else {
      dispatch(clearCart());
    }
    showToast('info', 'Cart cleared', { key: 'cart' });
  }, [isAuth, clearServerCart, dispatch]);

  return { onIncrease, onDecrease, onRemove, onClearCart, isUpdating };
};