import { configureStore } from '@reduxjs/toolkit'
import productsReducer from "./features/productsSlice.js";
import cartSlice  from './features/cartSlice.js';
export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartSlice
  },
})