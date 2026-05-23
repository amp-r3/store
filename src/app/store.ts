import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { productsApi } from '@/services/productsApi';
import cartReducer from '@/store/slices/cartSlice';
import themeSlice from '@/store/slices/themeSlice';
import { authApi } from '@/services/authApi';
import { persistStore } from 'redux-persist';
import authReducer from "@/store/slices/authSlice"
import wishlistReducer from '@/store/slices/wishlistSlice';
import { cartApi } from '@/services/cartApi';
import { wishlistApi } from '@/services/wishlistApi';
import { checkoutApi } from '@/services/checkoutApi';

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    theme: themeSlice,
    wishlist: wishlistReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(productsApi.middleware).concat(authApi.middleware).concat(cartApi.middleware).concat(wishlistApi.middleware).concat(checkoutApi.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;