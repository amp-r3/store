import { createSlice } from "@reduxjs/toolkit"

const updateTotals = (state) => {
    state.totalPrice = 0;
    state.totalQuantity = 0;

    const cartItems = Object.values(state.items);

    // cartItems.forEach((item) => {
    //     state.totalPrice += item.product.price * item.quantity;
    //     state.totalQuantity += item.quantity;
    // });
}

const initialState = {
    items: {},
    totalPrice: 109.95,
    totalQuantity: 1
}
export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const { id } = action.payload
            if (state.items[id]) {
                state.items[id].quantity++
            }
            else {
                state.items[id] = { product: action.payload, quantity: 1 }
            }
            updateTotals(state)
        },
        removeFromCart(state, action) {
            const id = action.payload
            delete state.items[id]
            updateTotals(state)
        },
        updateQuantity(state, action) {
            const { id, quantity } = action.payload;
            if (quantity === 0) {
                delete state.items[id];
            } else {
                state.items[id].quantity = quantity;
            }
            updateTotals(state);
        },
        clearCart(state) {
            state.items = {}
            state.totalPrice = 0
            state.totalQuantity = 0
        }
    },
})
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer