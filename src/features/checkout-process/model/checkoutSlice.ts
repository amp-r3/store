import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CartProduct } from "@/entities/cart";
import { CartData } from "@/entities/cart";

export interface CheckoutState {
    items: Record<number, CartData>;
}

const initialState: CheckoutState = {
    items: {},
}


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
            state.items = {}
        }
    },
})

export const { addToCheckout, clearCheckout } = checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer;
export default checkoutSlice.reducer;