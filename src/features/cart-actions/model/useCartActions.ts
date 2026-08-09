// useCartActions.ts
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/model";
import { selectIsAuth } from "@/entities/session";
import {
  useUpsertCartItemMutation,
  useDeleteCartItemMutation,
  useClearCartMutation,
  useRestoreCartItemMutation,
  useRestoreCartMutation,
  useGetCartQuery,
  changeQuantity,
  removeFromCart,
  clearCart,
  restoreCartItem,
  restoreCart,
  openCart,
  selectCartItemsMap,
  CartData,
} from "@/entities/cart";
import { showToast } from "@/shared/ui";

// Mirrors the aggregate threshold in ProductStockBadge ("There are a few
// left" at <= 10), applied here to the single size being added to the cart.
const LOW_STOCK_THRESHOLD = 10;

interface UseCartActionsReturn {
  onIncrease(sizeId: number, productId: number, stock?: number): void;
  onDecrease(sizeId: number, productId: number): void;
  onRemove(sizeId: number, productId: number, quantity: number): void;
  onClearCart(): void;
  isUpdating: boolean;
}

export const useCartActions = (): UseCartActionsReturn => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);

  const [upsertItem, { isLoading: isUpserting }] = useUpsertCartItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteCartItemMutation();
  const [clearServerCart, { isLoading: isClearing }] = useClearCartMutation();
  const [restoreServerItem, { isLoading: isRestoringItem }] = useRestoreCartItemMutation();
  const [restoreServerCart, { isLoading: isRestoringCart }] = useRestoreCartMutation();

  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuth });
  const localCart = useAppSelector(selectCartItemsMap);

  // Read via a ref rather than a `useCallback` dependency: the cart map
  // changes on every mutation, and depending on it directly would re-create
  // onIncrease/onDecrease/onRemove on every render, breaking React.memo on
  // CartItem. The callbacks only need the map's value at click time, not a
  // reactive subscription.
  const cartMapRef = useRef<Record<number, CartData>>({});
  useEffect(() => {
    cartMapRef.current = (isAuth ? serverCart : localCart) ?? {};
  }, [isAuth, serverCart, localCart]);

  const isUpdating = isUpserting || isDeleting || isClearing || isRestoringItem || isRestoringCart;

  const restoreItem = useCallback((sizeId: number, productId: number, quantity: number) => {
    if (isAuth) {
      restoreServerItem({ sizeId, productId, quantity });
    } else {
      dispatch(restoreCartItem({ sizeId, productId, quantity }));
    }
    showToast('added', 'Returned to cart', { key: 'cart-undo' });
  }, [isAuth, restoreServerItem, dispatch]);

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
    const quantityBefore = cartMapRef.current[sizeId]?.quantity ?? 0;
    const isRemoval = quantityBefore <= 1;

    if (isAuth) {
      upsertItem({ sizeId, productId, action: 'dec' });
    } else {
      dispatch(changeQuantity({ sizeId, productId, type: 'dec' }));
    }

    // Only the line's last unit leaving is a "removal" worth a toast — a
    // plain quantity step (3 -> 2) is visible in the counter already.
    if (isRemoval) {
      showToast('removed', 'Removed from cart', {
        key: 'cart',
        showTimer: true,
        action: { label: 'Undo', emphasis: 'ghost', onClick: () => restoreItem(sizeId, productId, 1) },
      });
    }
  }, [isAuth, upsertItem, dispatch, restoreItem]);

  const onRemove = useCallback((sizeId: number, productId: number, quantity: number) => {
    if (isAuth) {
      deleteItem(sizeId);
    } else {
      dispatch(removeFromCart(sizeId));
    }
    showToast('removed', 'Removed from cart', {
      key: 'cart',
      showTimer: true,
      action: { label: 'Undo', emphasis: 'ghost', onClick: () => restoreItem(sizeId, productId, quantity) },
    });
  }, [isAuth, deleteItem, dispatch, restoreItem]);

  const onClearCart = useCallback(() => {
    const snapshot = { ...cartMapRef.current };

    if (isAuth) {
      clearServerCart();
    } else {
      dispatch(clearCart());
    }

    const hasItems = Object.keys(snapshot).length > 0;
    showToast('removed', 'Cart cleared', {
      key: 'cart',
      showTimer: hasItems,
      action: hasItems
        ? {
          label: 'Undo',
          emphasis: 'ghost',
          onClick: () => {
            if (isAuth) {
              restoreServerCart(snapshot);
            } else {
              dispatch(restoreCart(snapshot));
            }
            showToast('added', 'Cart restored', { key: 'cart-undo' });
          },
        }
        : undefined,
    });
  }, [isAuth, clearServerCart, dispatch, restoreServerCart]);

  return { onIncrease, onDecrease, onRemove, onClearCart, isUpdating };
};