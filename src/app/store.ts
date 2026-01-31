import { productsApi } from '@/services/productsApi';
import cartSlice from '@/store/slices/cartSlice';
import { configureStore } from '@reduxjs/toolkit'


export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    cart: cartSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;