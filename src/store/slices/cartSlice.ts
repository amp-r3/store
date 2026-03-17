import { CartItem, Product } from "@/types/products";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist";
import storage from "../storage";

export interface CartState {
    items: Record<number, CartItem>;
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
        addToCart: (state, action: PayloadAction<Product>) => {
        const product = action.payload;
        const { id, stock } = product;

         if (state.items[id]) {
            if (state.items[id].quantity < stock) {
                state.items[id].quantity += 1;
            }
            } else {
            state.items[id] = { ...product, quantity: 1 };
            }
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            const id = action.payload;
            delete state.items[id];
        },
        changeQuantity: (state, action: PayloadAction<{ id: number; type: 'inc' | 'dec' }>) => {
            const { id, type } = action.payload;
            const item = state.items[id];
            if (!item) return;
        
            if (type === 'inc') {
                if (item.quantity < item.stock) {
                    item.quantity++;
                }
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

export const { addToCart, removeFromCart, changeQuantity, clearCart, openCart, closeCart } = cartSlice.actions
export default persistedCartReducer