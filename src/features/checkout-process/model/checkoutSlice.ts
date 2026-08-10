import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartProduct } from '@/entities/cart';
import { CartData } from '@/entities/cart';
import { CheckoutFormValues } from './checkoutMasterSchema';

export interface CheckoutState {
  items: Record<number, CartData>;
  draft: Partial<CheckoutFormValues> | null;
}

const initialState: CheckoutState = {
  items: {},
  draft: null,
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    addToCheckout: (state, action: PayloadAction<CartProduct[]>) => {
      state.items = {};
      action.payload.forEach(({ sizeId, productId, quantity }) => {
        state.items[sizeId] = { productId, quantity };
      });
    },
    clearCheckout: (state) => {
      state.items = {};
    },
    saveCheckoutDraft: (state, action: PayloadAction<Partial<CheckoutFormValues>>) => {
      state.draft = action.payload;
    },
    clearCheckoutDraft: (state) => {
      state.draft = null;
    },
  },
});

export const { addToCheckout, clearCheckout, saveCheckoutDraft, clearCheckoutDraft } =
  checkoutSlice.actions;
export const checkoutReducer = checkoutSlice.reducer;
export default checkoutSlice.reducer;
