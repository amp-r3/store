import { SharedRootState } from "@/shared/model";
import { createSelector } from "reselect";

const selectFavoriteDict = (state: SharedRootState) => state.wishlist.favoriteItems

export interface WishlistData {
  id: number
}

export const selectFavoritesArray = createSelector(
  [selectFavoriteDict],
  (items): WishlistData[] => 
    Object.entries(items).map(([id]) => ({
      id: Number(id)
    }))
)

export const selectIsFavorite = (state: SharedRootState, id: number) => {
  return state.wishlist.favoriteItems[id]
}
