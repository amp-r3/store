import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { persistStorage } from '@/shared/lib';
import { CartData } from '@/entities/cart';

export interface CartState {
  items: Record<number, CartData>;
  isOpen: boolean;
}

const initialState: CartState = {
  items: {},
  isOpen: false,
};

const cartPersistConfig = {
  key: 'cart',
  storage: persistStorage,
  whitelist: ['items'],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeFromCart: (state, action: PayloadAction<number>) => {
      const sizeId = action.payload;
      delete state.items[sizeId];
    },
    changeQuantity: (
      state,
      action: PayloadAction<{ sizeId: number; productId: number; type: 'inc' | 'dec' }>,
    ) => {
      const { sizeId, productId, type } = action.payload;
      const item = state.items[sizeId];
      if (!item) {
        if (type === 'inc') {
          state.items[sizeId] = { productId, quantity: 1 };
        }
        return;
      }

      if (type === 'inc') {
        item.quantity++;
      } else {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          delete state.items[sizeId];
        }
      }
    },
    clearCart: (state) => {
      state.items = {};
    },
    restoreCartItem: (
      state,
      action: PayloadAction<{ sizeId: number; productId: number; quantity: number }>,
    ) => {
      const { sizeId, productId, quantity } = action.payload;
      state.items[sizeId] = { productId, quantity };
    },
    restoreCart: (state, action: PayloadAction<Record<number, CartData>>) => {
      state.items = { ...state.items, ...action.payload };
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice.reducer);

export const {
  removeFromCart,
  changeQuantity,
  clearCart,
  restoreCartItem,
  restoreCart,
  openCart,
  closeCart,
} = cartSlice.actions;
export const cartReducer = persistedCartReducer;
export default persistedCartReducer;
