import { useState, useEffect, useRef } from 'react';
import style from './product-purchase-box.module.scss';
import { CartProduct } from '@/entities/cart';
import { addToCheckout, clearCheckout } from '@/features/checkout-process';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/shared/lib';
import { ProductSize, getPurchaseState } from '@/entities/product';
import { useAppDispatch } from '@/shared/model';
import { AddToCartButton, QuickBuyButton } from '@/features/cart-actions';

interface ProductPurchaseBoxProps {
  productId: number;
  quantity: number;
  hasDiscount: boolean;
  originalPrice: number;
  discountedPrice: number;
  handleCart(sizeId: number, type: 'inc' | 'dec'): void;
  sizes?: ProductSize[];
  selectedSizeId: number | undefined;
  hasSizes: boolean;
}

export const ProductPurchaseBox = ({
  productId,
  quantity,
  hasDiscount,
  originalPrice,
  discountedPrice,
  handleCart,
  sizes,
  selectedSizeId,
  hasSizes,
}: ProductPurchaseBoxProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isWarning, setIsWarning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  // Ref, not just the isNavigating state, because a genuine double-click can
  // fire both handlers before React re-renders with the disabled button.
  const isNavigatingRef = useRef(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const { isSizeSelected, currentStock, currentInStock, isLowStock, isOutOfStock, isMaxReached } =
    getPurchaseState({ quantity, sizes, selectedSizeId, hasSizes });

  const cartProduct: CartProduct[] = [
    { sizeId: selectedSizeId as number, productId: productId, quantity: 1 },
  ];

  const triggerWarning = () => {
    setIsWarning(true);
    setIsShaking(true);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setIsShaking(false), 400);
  };

  const handleAddToCart = () => {
    if (!isSizeSelected) {
      triggerWarning();
      return;
    }
    handleCart(selectedSizeId as number, 'inc');
  };

  const handleQuickBuy = () => {
    if (!isSizeSelected) {
      triggerWarning();
      return;
    }
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigating(true);
    dispatch(clearCheckout());
    dispatch(addToCheckout(cartProduct));
    router.push('/checkout');
  };

  useEffect(() => {
    if (isSizeSelected) {
      setIsWarning(false);
    }
  }, [isSizeSelected]);

  let stockClass = style['purchase-box__stock'];
  if (!hasSizes || selectedSizeId) {
    if (isLowStock) {
      stockClass += ` ${style['purchase-box__stock--low']}`;
    } else if (isOutOfStock) {
      stockClass += ` ${style['purchase-box__stock--out']}`;
    }
  }

  let stockText = '';
  if (hasSizes && !selectedSizeId) {
    stockText = 'Select a size to check stock';
  } else if (isOutOfStock) {
    stockText = 'Out of stock';
  } else if (isLowStock) {
    stockText = `Only ${currentStock} left!`;
  } else {
    stockText = `${currentStock} in stock`;
  }

  return (
    <div className={style['purchase-box']}>
      <div className={style['purchase-box__price-section']}>
        <div className={style['purchase-box__price-values']}>
          {hasDiscount ? (
            <>
              <span
                className={style['purchase-box__discount-price']}
                aria-label={`Discounted price: ${formatPrice(discountedPrice)}`}
              >
                {formatPrice(discountedPrice)}
              </span>
              <span
                className={style['purchase-box__original-price']}
                aria-label={`Original price: ${formatPrice(originalPrice)}`}
              >
                {formatPrice(originalPrice)}
              </span>
            </>
          ) : (
            <span className={style['purchase-box__discount-price']}>
              {formatPrice(originalPrice)}
            </span>
          )}
          {hasDiscount && (
            <div className={style['purchase-box__discount-badge']}>
              Save {formatPrice(originalPrice - discountedPrice)}
            </div>
          )}
        </div>
        <span
          className={stockClass}
          data-stock={
            hasSizes && !selectedSizeId
              ? 'select-size'
              : isOutOfStock
                ? 'empty'
                : isLowStock
                  ? 'low'
                  : 'in stock'
          }
        >
          {stockText}
        </span>
      </div>

      {!isSizeSelected && isWarning && (
        <div
          className={`${style['purchase-box__warning']} ${isShaking ? style['purchase-box__warning--shake'] : ''}`}
          aria-live="polite"
        >
          Please select a size to purchase this item
        </div>
      )}

      <div className={style['purchase-box__actions']}>
        <AddToCartButton
          quantity={quantity}
          onAddToCart={handleAddToCart}
          onIncrement={() => handleCart(selectedSizeId as number, 'inc')}
          onDecrement={() => handleCart(selectedSizeId as number, 'dec')}
          inStock={currentInStock}
          isMaxReached={isMaxReached}
          className={style['purchase-box__add-to-cart']}
          buttonText={isSizeSelected ? 'Add to Cart' : 'Select Size'}
          outOfStockText="Out of Stock"
          data-testid="add-to-cart-purchase-box"
        />
        <QuickBuyButton
          onClick={handleQuickBuy}
          disabled={!currentInStock}
          isLoading={isNavigating}
          className={style['purchase-box__quick-buy']}
          data-testid="quick-buy-purchase-box"
        />
      </div>

      {!currentInStock && (
        <div className={style['purchase-box__out-of-stock-notice']}>
          Out of stock. Sign up for notifications.
        </div>
      )}
    </div>
  );
};
