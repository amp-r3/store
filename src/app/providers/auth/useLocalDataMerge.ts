import { useEffect } from 'react';
import { baseApi } from '@/shared/api';
import { useAppDispatch, useAppStore } from '@/shared/model';
import { useSyncCartMutation, clearCart } from '@/entities/cart';
import { useSyncWishlistMutation, clearFavorite } from '@/entities/wishlist';
import { logout } from '@/entities/session';
import { supabase } from '@/shared/api/supabase/client';

/** Owns the local (guest) ↔ server cart/wishlist lifecycle: merges
 * localStorage-backed items into the server on sign-in, and clears all local
 * app state back to guest defaults on sign-out. */
export const useLocalDataMerge = () => {
  const [syncCart] = useSyncCartMutation();
  const [syncWishlist] = useSyncWishlistMutation();
  const dispatch = useAppDispatch();
  const store = useAppStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const currentState = store.getState();
        const localWishlistItems = currentState.wishlist.favoriteItems;
        const localCartItems = currentState.cart.items;

        if (localCartItems && Object.keys(localCartItems).length > 0) {
          try {
            await syncCart(localCartItems).unwrap();
            dispatch(clearCart());
          } catch (error) {
            console.error('Error synchronizing cart:', error);
          }
        }

        if (localWishlistItems && Object.keys(localWishlistItems).length > 0) {
          try {
            await syncWishlist(localWishlistItems).unwrap();
            dispatch(clearFavorite());
          } catch (error) {
            console.error('Error synchronizing wishlist:', error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch(baseApi.util.resetApiState());
        dispatch(clearFavorite());
        dispatch(clearCart());
        dispatch(logout());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, store, syncCart, syncWishlist]);
};
