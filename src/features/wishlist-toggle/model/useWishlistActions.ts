import { useAppDispatch, useAppSelector } from "@/shared/model"
import { useCallback } from "react"
import { selectIsAuth } from "@/entities/session";
import { useGetWishlistQuery, useToggleWishlistMutation, toogleFavorite } from "@/entities/wishlist";

interface useWishlistActionsProps {
  onWishlist(id: number): void;
  isUpdating: boolean;
}

export const useWishlistActions = (): useWishlistActionsProps => {
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector(selectIsAuth)

  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuth });

  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

  const onWishlist = useCallback((id: number) => {
    if (isAuth) {
      toggleWishlist({ productId: id, isInWishlist: !!wishlistData?.[id] })
    } else {
      dispatch(toogleFavorite(id))
    }
  }, [isAuth, toggleWishlist, dispatch, wishlistData])

  return { onWishlist, isUpdating: isToggling }
}