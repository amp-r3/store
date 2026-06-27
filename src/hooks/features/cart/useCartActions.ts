// useCartActions.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../common/redux";
import { changeQuantity, clearCart, removeFromCart } from "@/store/slices/cartSlice";
import { selectIsAuth } from "@/store/selectors/authSelectors";
import { useClearCartMutation, useDeleteCartItemMutation, useUpsertCartItemMutation } from "@/services/cartApi";

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
  }, [isAuth, upsertItem, dispatch])

  const onDecrease = useCallback((sizeId: number, productId: number) => {
    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'dec' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'dec' }));
    }
  }, [isAuth, upsertItem, dispatch]);

  const onRemove = useCallback((sizeId: number) => {
    if (isAuth) {
      deleteItem(sizeId);
    } else {
      dispatch(removeFromCart(sizeId));
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