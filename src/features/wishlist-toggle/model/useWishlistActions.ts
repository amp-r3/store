import { useAppDispatch, useAppSelector } from "@/shared/model"
import { useCallback } from "react"
import { selectIsAuth } from "@/entities/session";
import { useGetWishlistQuery, useToggleWishlistMutation, toogleFavorite, WishlistState } from "@/entities/wishlist";
import { notify } from "@/entities/notification";

interface useWishlistActionsProps {
  onWishlist(id: number): void;
  isUpdating: boolean;
}

export const useWishlistActions = (): useWishlistActionsProps => {
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector(selectIsAuth)
  const guestFavoriteItems = useAppSelector((state: { wishlist: WishlistState }) => state.wishlist.favoriteItems)

  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuth });

  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

  const onWishlist = useCallback((id: number) => {
    const isInWishlist = isAuth ? !!wishlistData?.[id] : !!guestFavoriteItems[id];

    if (isAuth) {
      toggleWishlist({ productId: id, isInWishlist })
    } else {
      dispatch(toogleFavorite(id))
    }

    dispatch(
      isInWishlist
        ? notify({ type: 'info', text: 'Removed from wishlist', key: 'wishlist' })
        : notify({
          type: 'success',
          text: 'Added to wishlist',
          key: 'wishlist',
          action: { label: 'View', to: '/wishlist' },
        })
    );
  }, [isAuth, toggleWishlist, dispatch, wishlistData, guestFavoriteItems])

  return { onWishlist, isUpdating: isToggling }
}