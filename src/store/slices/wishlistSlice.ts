import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import storage from "../storage";
import { persistReducer } from "redux-persist";

export interface WishlistState {
  favoriteItems: Record<string, boolean>;
}

const initialState: WishlistState = {
  favoriteItems: {},
}

const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
  whitelist: ['favoriteItems']
}

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toogleFavorite(state, action: PayloadAction<number>) {
      const productId = action.payload

      if (state.favoriteItems[productId]) {
        delete state.favoriteItems[productId]
      } else {
        state.favoriteItems[productId] = true
      }
    }
  }
})

const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistSlice.reducer)

export const { toogleFavorite } = wishlistSlice.actions
export default persistedWishlistReducer