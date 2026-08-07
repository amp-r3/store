import { createSelector } from "@reduxjs/toolkit";
import { CartProduct } from "@/entities/cart";
import { CheckoutState } from "./checkoutSlice";

export const selectCheckoutItemsMap = (state: { checkout: CheckoutState }) => state.checkout.items;
export const selectCheckoutDraft = (state: { checkout: CheckoutState }) => state.checkout.draft;

export const selectCheckoutItemsArray = createSelector(
    [selectCheckoutItemsMap],
    (itemsMap): CartProduct[] => 
        Object.entries(itemsMap).map(([sizeId, data]) => ({
            sizeId: Number(sizeId),
            productId: data.productId,
            quantity: data.quantity
        }))
);
