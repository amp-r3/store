
// I haven't moved types/products.ts yet. Let's just use `any` for now or import it from types.
// But better to define `SharedRootState` with the exact slices needed.

export interface SharedRootState {
    auth: {
        token: string | null;
        user: any;
    };
    cart: {
        items: Record<number, any>;
        isOpen: boolean;
    };
    wishlist: {
        favoriteItems: Record<number, boolean>;
    };
    reviewModal: {
        isOpen: boolean;
        productId: string | null;
    };
    checkout: any;
}
