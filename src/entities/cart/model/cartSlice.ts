import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist";
import storage from "@/app/providers/store/storage";
import { CartData } from "@/entities/cart";

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
            const sizeId = action.payload;
            delete state.items[sizeId];
        },
        changeQuantity: (state, action: PayloadAction<{ sizeId: number; productId: number; type: 'inc' | 'dec' }>) => {
            const { sizeId, productId, type } = action.payload;
            const item = state.items[sizeId];
            if (!item) {
                if (type === 'inc') {
                    state.items[sizeId] = { productId, quantity: 1 };
                }
                return;
            };

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
export const cartReducer = persistedCartReducer;
export default persistedCartReducer;