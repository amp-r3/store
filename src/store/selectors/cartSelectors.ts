import { RootState } from "@/app/store";
import { applyDiscount } from "@/utils";
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
        (sum, item) => sum + applyDiscount(item.discountPercentage, item.price) * item.quantity, 0
    )
);

export const selectCartTotalQuantity = createSelector(
    [selectCartItems],
    (items) => items.reduce((total, item) => total + item.quantity, 0)
);
