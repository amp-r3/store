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
import { baseApi } from '@/shared/api';
import { persistStorage } from '@/shared/lib';
import { authReducer } from '@/entities/session';
import { cartReducer } from '@/entities/cart';
import { wishlistReducer } from '@/entities/wishlist';
import { notificationReducer, notificationMiddleware } from '@/entities/notification';
import { checkoutReducer } from '@/features/checkout-process';
import { reviewModalReducer } from '@/features/order-review';
// injectEndpoints only runs when the module is evaluated; these entities have
// no reducer of their own to pull them in, so import them for the side effect
// of registering their RTK Query endpoints on baseApi.
import '@/entities/product';
import '@/entities/review';
import '@/entities/order';

const checkoutPersistConfig = {
  key: 'checkout',
  storage: persistStorage,
  whitelist: ['items', 'draft']
};

const persistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutReducer);

// A factory rather than a module-level store: this module is evaluated in
// the Node server process too (AppProviders renders there), and a single
// shared store instance would be reused across every concurrent SSR
// request. Each render gets its own store via AppProviders' useRef instead.
export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      checkout: persistedCheckoutReducer,
      reviewModal: reviewModalReducer,
      notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
        .concat(baseApi.middleware, notificationMiddleware)
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

declare global {
  type GlobalRootState = RootState;
  type GlobalAppDispatch = AppDispatch;
}