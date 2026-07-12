import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistReducer
} from 'redux-persist';
import { persistStore } from 'redux-persist';
import storage from '@/app/providers/store/storage';
import { productsApi } from '@/entities/product';
import { reviewApi } from '@/entities/review';
import { authApi, authReducer } from '@/entities/session';
import { cartApi, cartReducer } from '@/entities/cart';
import { wishlistApi, wishlistReducer } from '@/entities/wishlist';
import { checkoutApi } from '@/features/checkout-process';
import { checkoutReducer } from '@/features/checkout-process';
import { orderApi } from '@/entities/order';
import { reviewModalReducer } from '@/features/order-review';

const checkoutPersistConfig = {
  key: 'checkout',
  storage,
  whitelist: ['items']
};

const persistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutReducer);

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
    checkout: persistedCheckoutReducer,
    reviewModal: reviewModalReducer,
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

declare global {
  type GlobalRootState = RootState;
  type GlobalAppDispatch = AppDispatch;
}