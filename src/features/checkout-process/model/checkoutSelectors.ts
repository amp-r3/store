import { RootState } from "@/app/store";
import { createSelector } from "@reduxjs/toolkit";
import { CartProduct } from "../../../entities/cart/model/cartSelectors";

export const selectCheckoutItemsMap = (state: RootState) => state.checkout.items;

export const selectCheckoutItemsArray = createSelector(
    [selectCheckoutItemsMap],
    (itemsMap): CartProduct[] => 
        Object.entries(itemsMap).map(([sizeId, data]) => ({
            sizeId: Number(sizeId),
            productId: data.productId,
            quantity: data.quantity
        }))
);
