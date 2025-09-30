import { createSlice } from "@reduxjs/toolkit"

const updateTotals = (state) => {
    state.totalPrice = 0;
    state.totalQuantity = 0;

    const cartItems = Object.values(state.items);

    cartItems.forEach((item) => {
        state.totalPrice += item.product.price * item.quantity;
        state.totalQuantity += item.quantity;
    });
}

const initialState = {
    items: {
        '1': {
            product: {
                id: 1, title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops", price: 109.95, description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday", category: "men's clothing", image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png", rating: { rate: 3.9, count: 120 }
            },
            quantity: 1
        }
    },
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