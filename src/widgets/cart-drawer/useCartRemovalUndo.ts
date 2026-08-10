import { useCallback, useEffect, useRef, useState } from 'react';
import { CartData, CartItemDetails, CartProduct } from '@/entities/cart';

export const CART_UNDO_DURATION_MS = 6000;

export interface RemovedEntry {
  sizeId: number;
  productId: number;
  quantity: number;
  index: number;
  title: string;
}

export interface ClearedEntry {
  snapshot: Record<number, CartData>;
  count: number;
}

interface UseCartRemovalUndoParams {
  cartItems: CartProduct[];
  cartDetails: (CartItemDetails | null)[];
  isOpen: boolean;
}

interface UseCartRemovalUndoReturn {
  removedEntries: RemovedEntry[];
  clearedEntry: ClearedEntry | null;
  handleRemoved(sizeId: number, productId: number, quantity: number): void;
  handleCleared(snapshot: Record<number, CartData>): void;
  // Cancels the pending timer and drops the entry — callers still owe the
  // actual restore call (useCartActions' onRestoreItem/onRestoreCart).
  dismissRemoval(sizeId: number): void;
  dismissCleared(): void;
}

// Owns the drawer's transient "removed, undoable" state. Local component
// state, not Redux — it's per-drawer UI state (a countdown + a snapshot
// closure), not something any other slice or a future session should see.
export const useCartRemovalUndo = ({
  cartItems,
  cartDetails,
  isOpen,
}: UseCartRemovalUndoParams): UseCartRemovalUndoReturn => {
  const [removedEntries, setRemovedEntries] = useState<RemovedEntry[]>([]);
  const [clearedEntry, setClearedEntry] = useState<ClearedEntry | null>(null);

  // handleRemoved/handleCleared must stay referentially stable — they're
  // passed straight into useCartActions, which puts them in its own
  // useCallback deps (onIncrease/onDecrease/onRemove/onClearCart), so a
  // reactive dependency here would recreate those on every cart change and
  // break React.memo on CartItem. Read the live list via a ref instead.
  const listRef = useRef<{ cartItems: CartProduct[]; cartDetails: (CartItemDetails | null)[] }>({
    cartItems,
    cartDetails,
  });
  useEffect(() => {
    listRef.current = { cartItems, cartDetails };
  }, [cartItems, cartDetails]);

  const itemTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissRemoval = useCallback((sizeId: number) => {
    clearTimeout(itemTimers.current[sizeId]);
    delete itemTimers.current[sizeId];
    setRemovedEntries((entries) => entries.filter((entry) => entry.sizeId !== sizeId));
  }, []);

  const dismissCleared = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = null;
    setClearedEntry(null);
  }, []);

  const handleRemoved = useCallback(
    (sizeId: number, productId: number, quantity: number) => {
      const { cartItems: items, cartDetails: details } = listRef.current;
      const index = items.findIndex((item) => item.sizeId === sizeId);
      const title = (index >= 0 ? details[index]?.title : undefined) ?? 'Item';

      clearTimeout(itemTimers.current[sizeId]);
      itemTimers.current[sizeId] = setTimeout(() => dismissRemoval(sizeId), CART_UNDO_DURATION_MS);

      setRemovedEntries((entries) => [
        ...entries.filter((entry) => entry.sizeId !== sizeId),
        { sizeId, productId, quantity, index: index >= 0 ? index : items.length, title },
      ]);
    },
    [dismissRemoval],
  );

  const handleCleared = useCallback(
    (snapshot: Record<number, CartData>) => {
      Object.values(itemTimers.current).forEach(clearTimeout);
      itemTimers.current = {};
      setRemovedEntries([]);

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(dismissCleared, CART_UNDO_DURATION_MS);
      setClearedEntry({ snapshot, count: Object.keys(snapshot).length });
    },
    [dismissCleared],
  );

  // Drawer closed mid-countdown -> reset the affordance; the removal
  // itself stays committed (it was already an optimistic mutation).
  useEffect(() => {
    if (isOpen) return;
    Object.values(itemTimers.current).forEach(clearTimeout);
    itemTimers.current = {};
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = null;
    setRemovedEntries([]);
    setClearedEntry(null);
  }, [isOpen]);

  useEffect(
    () => () => {
      Object.values(itemTimers.current).forEach(clearTimeout);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    },
    [],
  );

  return {
    removedEntries,
    clearedEntry,
    handleRemoved,
    handleCleared,
    dismissRemoval,
    dismissCleared,
  };
};
