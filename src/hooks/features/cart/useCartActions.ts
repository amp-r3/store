// useCartActions.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../common/redux";
import { changeQuantity, clearCart, removeFromCart } from "@/store/slices/cartSlice";
import { selectIsAuth } from "@/store/selectors/authSelectors";
import { useClearCartMutation, useDeleteCartItemMutation, useUpsertCartItemMutation } from "@/services/cartApi";

interface UseCartActionsReturn {
  onIncrease(id: number): void;
  onDecrease(id: number): void;
  onRemove(id: number): void;
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

  const onIncrease = useCallback((id: number) => {
    if (isAuth) {
      upsertItem({ productId: id, action: 'inc' });
    } else {
      dispatch(changeQuantity({ id, type: 'inc' }));
    }
  }, [isAuth, upsertItem, dispatch])

  const onDecrease = useCallback((id: number) => {
    if (isAuth) {
      upsertItem({ productId: id, action: 'dec' });
    } else {
      dispatch(changeQuantity({ id, type: 'dec' }));
    }
  }, [isAuth, upsertItem, dispatch]);

  const onRemove = useCallback((id: number) => {
    if (isAuth) {
      deleteItem(id);
    } else {
      dispatch(removeFromCart(id));
    }
  }, [isAuth, deleteItem, dispatch]);

  const onClearCart = useCallback(() => {
    if (isAuth) {
      clearServerCart();
    } else {
      dispatch(clearCart());
    }
  }, [isAuth, clearServerCart, dispatch]);

  return { onIncrease, onDecrease, onRemove, onClearCart, isUpdating };
};