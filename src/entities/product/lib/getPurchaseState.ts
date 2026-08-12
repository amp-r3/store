import { ProductSize } from '../model/types';

interface GetPurchaseStateArgs {
  quantity: number;
  sizes?: ProductSize[];
  selectedSizeId: number | undefined;
  hasSizes: boolean;
}

export const getPurchaseState = ({
  quantity,
  sizes,
  selectedSizeId,
  hasSizes,
}: GetPurchaseStateArgs) => {
  const isSizeSelected = !hasSizes || (selectedSizeId !== undefined && selectedSizeId !== null);
  const selectedSize = hasSizes && sizes ? sizes.find((s) => s.id === selectedSizeId) : null;

  // Without a chosen size there's no single stock count to report — 0 is the
  // honest "unknown" value here, not a stand-in for "definitely out of
  // stock". currentInStock is derived separately below so purchase controls
  // stay interactive (and the "select a size" prompt still fires) as long as
  // at least one size has stock.
  const currentStock = selectedSize ? selectedSize.stock : 0;

  const currentInStock = selectedSize
    ? selectedSize.stock > 0
    : hasSizes && !!sizes && sizes.some((s) => s.stock > 0);

  const isOutOfStock = !currentInStock;
  const isLowStock = currentStock > 0 && currentStock < 5;
  // Meaningless without a selected size — there's no specific stock count to
  // compare `quantity` against yet.
  const isMaxReached = isSizeSelected && (quantity ?? 0) >= (currentStock ?? 0);

  return {
    isSizeSelected,
    currentStock,
    currentInStock,
    isLowStock,
    isOutOfStock,
    isMaxReached,
  };
};
