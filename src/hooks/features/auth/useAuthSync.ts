import { cartApi, useSyncCartMutation } from "@/services/cartApi";
import { useSyncWishlistMutation, wishlistApi } from "@/services/wishlistApi";
import { supabase } from "@/supabase";
import { useEffect } from "react";
import { useAppDispatch } from "../../common/redux";
import { logout, setSession } from "@/store/slices/authSlice";
import { store } from "@/app/store";
import { clearCart } from "@/store/slices/cartSlice";
import { clearFavorite } from "@/store/slices/wishlistSlice";

export const useAuthSync = () => {
  const [syncCart] = useSyncCartMutation();
  const [syncWishlist] = useSyncWishlistMutation();
  const dispatch = useAppDispatch()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching user profile:', profileError);
            }

            dispatch(setSession({
              user: {
                id: session.user.id,
                email: session.user.email!,
                accessToken: session.access_token,
                firstName: profile?.first_name || '',
                lastName: profile?.last_name || '',
                username: profile?.username || '',
              },
              token: session.access_token,
            }));
          } catch (error) {
            console.error('Failed to load profile inside auth listener:', error);
          }
        }

        if (event === 'SIGNED_IN' && session?.user) {
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
        }

        else if (event === 'SIGNED_OUT') {
          dispatch(cartApi.util.resetApiState());
          dispatch(wishlistApi.util.resetApiState());
          dispatch(clearFavorite());
          dispatch(clearCart());
          dispatch(logout());
        }
      });

    return () => subscription.unsubscribe();
  }, [dispatch, syncCart]);
}