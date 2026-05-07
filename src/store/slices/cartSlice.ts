import { CartData } from "@/types/products";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist";
import storage from "../storage";

export interface CartState {
    items: Record<number, CartData>;
    isOpen: boolean;
}

const initialState: CartState = {
    items: {},
    isOpen: false
}

const cartPersistConfig = {
    key: 'cart',
    storage,
    whitelist: ['items']
}

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        removeFromCart: (state, action: PayloadAction<number>) => {
            const id = action.payload;
            delete state.items[id];
        },
        changeQuantity: (state, action: PayloadAction<{ id: number; type: 'inc' | 'dec' }>) => {
            const { id, type } = action.payload;
            const item = state.items[id];
            if (!item) {
                state.items[id] = { quantity: 1 };
                return
            };

            if (type === 'inc') {
                item.quantity++;
            } else {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    delete state.items[id];
                }
            }
        },
        clearCart: (state) => {
            state.items = {};
        },
        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        },

    },
})

const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice.reducer)

export const { removeFromCart, changeQuantity, clearCart, openCart, closeCart } = cartSlice.actions
export default persistedCartReducer