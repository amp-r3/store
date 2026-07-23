// useCartActions.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/model";
import { selectIsAuth } from "@/entities/session";
import { useUpsertCartItemMutation, useDeleteCartItemMutation, useClearCartMutation, changeQuantity, removeFromCart, clearCart } from "@/entities/cart";
import { notify } from "@/entities/notification";

interface UseCartActionsReturn {
  onIncrease(sizeId: number, productId: number): void;
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

  const onIncrease = useCallback((sizeId: number, productId: number) => {
    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'inc' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'inc' }));
    }
    dispatch(notify({ type: 'success', text: 'Added to cart', key: 'cart' }));
  }, [isAuth, upsertItem, dispatch])

  const onDecrease = useCallback((sizeId: number, productId: number) => {
    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'dec' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'dec' }));
    }
    dispatch(notify({ type: 'info', text: 'Removed from cart', key: 'cart' }));
  }, [isAuth, upsertItem, dispatch]);

  const onRemove = useCallback((sizeId: number) => {
    if (isAuth) {
      deleteItem(sizeId);
    } else {
      dispatch(removeFromCart(sizeId));
    }
    dispatch(notify({ type: 'info', text: 'Removed from cart', key: 'cart' }));
  }, [isAuth, deleteItem, dispatch]);

  const onClearCart = useCallback(() => {
    if (isAuth) {
      clearServerCart();
    } else {
      dispatch(clearCart());
    }
    dispatch(notify({ type: 'info', text: 'Cart cleared', key: 'cart' }));
  }, [isAuth, clearServerCart, dispatch]);

  return { onIncrease, onDecrease, onRemove, onClearCart, isUpdating };
};