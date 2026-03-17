import { RootState } from "@/app/store";
import { createSelector } from "reselect";

// Basic selector (returns object)
const selectCartItemsMap = (state: RootState) => state.cart.items;

export const selectIsCartOpen = (state: RootState) => state.cart.isOpen;

// Render selector (turns an object into an array)
export const selectCartItems = createSelector(
    [selectCartItemsMap],
    (itemsMap) => Object.values(itemsMap)
);

export const selectIsMaxReached = (productId: number, stock: number) =>
    createSelector(selectCartItems, (items) => {
        const item = items.find(i => i.id === productId);
        if (!item) return false;
        return item.quantity >= stock
    })

export const selectCartTotalQuantity = createSelector(
    [selectCartItems],
    (items) => items.reduce((total, item) => total + item.quantity, 0)
);
