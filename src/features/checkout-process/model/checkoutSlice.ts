import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist";
import storage from "@/app/providers/store/storage";
import { CartProduct } from "../../../entities/cart/model/cartSelectors";
import { CartData } from "@/entities/cart";

export interface CheckoutState {
    items: Record<number, CartData>;
}

const initialState: CheckoutState = {
    items: {},
}

const checkoutPersistConfig = {
    key: 'checkout',
    storage,
    whitelist: ['items']
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

const persistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutSlice.reducer)

export const { addToCheckout, clearCheckout } = checkoutSlice.actions
export const checkoutReducer = persistedCheckoutReducer;
export default persistedCheckoutReducer;