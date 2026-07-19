import { createSelector } from "reselect";
import { WishlistState } from "./wishlistSlice";

const selectFavoriteDict = (state: { wishlist: WishlistState }) => state.wishlist.favoriteItems

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

export const selectIsFavorite = (state: { wishlist: WishlistState }, id: number) => {
  return state.wishlist.favoriteItems[id]
}
