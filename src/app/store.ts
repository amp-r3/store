import cartSlice from '@/store/slices/cartSlice';
import productsSlice from '@/store/slices/productsSlice';
import { configureStore } from '@reduxjs/toolkit'


export const store = configureStore({
  reducer: {
    products: productsSlice,
    cart: cartSlice
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;