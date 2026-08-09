import { useAppDispatch, useAppSelector } from "@/shared/model"
import { useCallback } from "react"
import { selectIsAuth } from "@/entities/session";
import { useGetWishlistQuery, useToggleWishlistMutation, toogleFavorite, WishlistState } from "@/entities/wishlist";
import { showToast } from "@/shared/ui";

interface useWishlistActionsProps {
  onWishlist(id: number, price?: number): void;
  isUpdating: boolean;
}

export const useWishlistActions = (): useWishlistActionsProps => {
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector(selectIsAuth)
  const guestFavoriteItems = useAppSelector((state: { wishlist: WishlistState }) => state.wishlist.favoriteItems)

  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuth });

  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

  const onWishlist = useCallback((id: number, price?: number) => {
    const isInWishlist = isAuth ? !!wishlistData?.[id] : !!guestFavoriteItems[id];

    if (isAuth) {
      toggleWishlist({ productId: id, isInWishlist, priceAtAdd: isInWishlist ? undefined : price })
    } else {
      dispatch(toogleFavorite(id))
    }

    if (isInWishlist) {
      // Undo is UI only for now — it dismisses the toast, it does not restore the item.
      showToast('removed', 'Removed from wishlist', {
        key: 'wishlist',
        action: { label: 'Undo', emphasis: 'ghost' },
      });
    } else {
      showToast('added', 'Added to wishlist', {
        key: 'wishlist',
        action: { label: 'View', to: '/wishlist' },
      });
    }
  }, [isAuth, toggleWishlist, dispatch, wishlistData, guestFavoriteItems])

  return { onWishlist, isUpdating: isToggling }
}