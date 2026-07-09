import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import authReducer from "@/store/slices/authSlice"
import wishlistReducer from '@/store/slices/wishlistSlice';
import cartReducer from '@/store/slices/cartSlice';
import checkoutReducer from '@/store/slices/checkoutSlice'
import { productsApi } from '@/services/productsApi';
import { reviewApi } from '@/services/reviewApi';
import { authApi } from '@/services/authApi';
import { persistStore } from 'redux-persist';
import { cartApi } from '@/services/cartApi';
import { wishlistApi } from '@/services/wishlistApi';
import { checkoutApi } from '@/services/checkoutApi';
import { orderApi } from '@/services/orderApi';

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(productsApi.middleware)
      .concat(reviewApi.middleware)
      .concat(authApi.middleware)
      .concat(cartApi.middleware)
      .concat(wishlistApi.middleware)
      .concat(checkoutApi.middleware)
      .concat(orderApi.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;