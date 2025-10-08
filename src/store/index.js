import { configureStore } from '@reduxjs/toolkit'
import productsReducer from "@/features/products/store/productsSlice.js";
import cartSlice  from '@/features/cart/store/cartSlice.js';
export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartSlice
  },
})