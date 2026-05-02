import { RootState } from "@/app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCartItemsMap = (state: RootState) => state.cart.items;
export const selectIsCartOpen = (state: RootState) => state.cart.isOpen;

export interface CartProduct {
    id: number;
    quantity: number;
}

export const selectCartItemsArray = createSelector(
    [selectCartItemsMap],
    (itemsMap): CartProduct[] => 
        Object.entries(itemsMap).map(([id, data]) => ({
            id: Number(id),
            quantity: data.quantity
        }))
);

export const selectCartTotalQuantity = createSelector(
    [selectCartItemsMap],
    (itemsMap) => 
        Object.values(itemsMap).reduce((total, item) => total + item.quantity, 0)
);

export const selectQuantityById = (state: RootState, productId: number) => {
    return state.cart[productId]?.quantity || 0;
};

export const selectIsMaxReached = (quantity: number, stock: number) => {
    return quantity >= stock;
};