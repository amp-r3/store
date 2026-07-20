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
import { baseApi } from '@/shared/api';
import { authReducer } from '@/entities/session';
import { cartReducer } from '@/entities/cart';
import { wishlistReducer } from '@/entities/wishlist';
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
  storage,
  whitelist: ['items']
};

const persistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutReducer);

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
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
      .concat(baseApi.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

declare global {
  type GlobalRootState = RootState;
  type GlobalAppDispatch = AppDispatch;
}