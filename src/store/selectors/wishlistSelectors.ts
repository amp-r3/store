import { RootState } from "@/app/store";
import { createSelector } from "reselect";

const selectFavoriteDict = (state: RootState) => state.wishlist.favoriteItems

export const selectFavoritesArray = createSelector(
  [selectFavoriteDict],
  (items) => 
    Object.entries(items).map(([id]) => ({
      id: Number(id)
    }))
)

export const selectIsFavorite = (state: RootState, id: number) => {
  return state.wishlist.favoriteItems[id]
}
