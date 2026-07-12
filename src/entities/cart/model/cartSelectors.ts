import { SharedRootState } from "@/shared/model";
import { createSelector } from "@reduxjs/toolkit";

export const selectCartItemsMap = (state: SharedRootState) => state.cart.items;
export const selectIsCartOpen = (state: SharedRootState) => state.cart.isOpen;

export interface CartProduct {
    sizeId: number;
    productId: number;
    quantity: number;
}

export const selectCartItemsArray = createSelector(
    [selectCartItemsMap],
    (itemsMap): CartProduct[] => 
        Object.entries(itemsMap).map(([sizeId, data]) => ({
            sizeId: Number(sizeId),
            productId: data.productId,
            quantity: data.quantity
        }))
);

export const selectCartTotalQuantity = createSelector(
    [selectCartItemsMap],
    (itemsMap) => 
        Object.values(itemsMap).reduce((total, item) => total + item.quantity, 0)
);

export const selectQuantityById = (state: SharedRootState, productId: number) => {
    return state.cart.items[productId]?.quantity || 0;
};

export const selectIsMaxReached = (quantity: number, stock: number) => {
    return quantity >= stock;
};