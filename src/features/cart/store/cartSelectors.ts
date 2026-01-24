import { RootState } from "@/store";
import { createSelector } from "reselect";

// Basic selector (returns object)
const selectCartItemsMap = (state: RootState) => state.cart.items;

export const selectIsCartOpen = (state: RootState) => state.cart.isOpen;

// Render selector (turns an object into an array)
export const selectCartItems = createSelector(
    [selectCartItemsMap],
    (itemsMap) => Object.values(itemsMap)
);

// TotalPrice Selector
export const selectCartTotal = createSelector(
    [selectCartItemsMap],
    (itemsMap) => Object.values(itemsMap).reduce<number>(
        (sum, item) => sum + item.price * item.quantity, 0
    )
);