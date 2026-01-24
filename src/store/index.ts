import { configureStore } from '@reduxjs/toolkit'

import cartSlice from '@/features/cart/store/cartSlice';
import productsSlice from '@/features/products/store/productsSlice';

export const store = configureStore({
  reducer: {
    products: productsSlice,
    cart: cartSlice
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;