import { ProductSize } from '../model/types';

interface GetPurchaseStateArgs {
    quantity: number;
    sizes?: ProductSize[];
    selectedSizeId: number | undefined;
    hasSizes: boolean;
}

export const getPurchaseState = ({ quantity, sizes, selectedSizeId, hasSizes }: GetPurchaseStateArgs) => {
    const isSizeSelected = !hasSizes || (selectedSizeId !== undefined && selectedSizeId !== null);
    const selectedSize = hasSizes && sizes ? sizes.find(s => s.id === selectedSizeId) : null;

    const currentStock = hasSizes && sizes
        ? (selectedSize ? selectedSize.stock : (sizes.some(s => s.stock > 0) ? 5 : 0))
        : 0;
    const currentInStock = currentStock > 0;
    const isLowStock = currentStock > 0 && currentStock < 5;
    const isOutOfStock = currentStock === 0;
    const isMaxReached = (quantity ?? 0) >= (currentStock ?? 0);

    return {
        isSizeSelected,
        currentStock,
        currentInStock,
        isLowStock,
        isOutOfStock,
        isMaxReached,
    };
};
