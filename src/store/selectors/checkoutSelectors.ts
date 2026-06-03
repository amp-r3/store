import { RootState } from "@/app/store";
import { createSelector } from "@reduxjs/toolkit";
import { CartProduct } from "./cartSelectors";

export const selectCheckoutItemsMap = (state: RootState) => state.checkout.items;

export const selectCheckoutItemsArray = createSelector(
    [selectCheckoutItemsMap],
    (itemsMap): CartProduct[] => 
        Object.entries(itemsMap).map(([id, data]) => ({
            id: Number(id),
            quantity: data.quantity
        }))
);
