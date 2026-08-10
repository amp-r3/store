import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { persistStorage } from '@/shared/lib';
import { persistReducer } from 'redux-persist';

export interface WishlistState {
  favoriteItems: Record<number, boolean>;
}

const initialState: WishlistState = {
  favoriteItems: {},
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage: persistStorage,
  whitelist: ['favoriteItems'],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toogleFavorite(state, action: PayloadAction<number>) {
      const productId = action.payload;

      if (state.favoriteItems[productId]) {
        delete state.favoriteItems[productId];
      } else {
        state.favoriteItems[productId] = true;
      }
    },
    clearFavorite(state) {
      state.favoriteItems = {};
    },
    // Unlike toogleFavorite, unconditionally adds — used to undo a removal,
    // whose click can land after the favorite state has already changed.
    addFavorite(state, action: PayloadAction<number>) {
      state.favoriteItems[action.payload] = true;
    },
  },
});

const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistSlice.reducer);

export const { toogleFavorite, clearFavorite, addFavorite } = wishlistSlice.actions;
export const wishlistReducer = persistedWishlistReducer;
export default persistedWishlistReducer;
