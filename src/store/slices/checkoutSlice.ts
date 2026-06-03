import { CartData } from "@/types/products";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist";
import storage from "../storage";
import { CartProduct } from "../selectors/cartSelectors";

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
            action.payload.forEach(({ id, quantity }) => {
                state.items[id] = { quantity };
            });
        },
        clearCheckout: (state) => {
            state.items = {}
        }
    },
})

const persistedCartReducer = persistReducer(checkoutPersistConfig, checkoutSlice.reducer)

export const { addToCheckout, clearCheckout } = checkoutSlice.actions
export default persistedCartReducer