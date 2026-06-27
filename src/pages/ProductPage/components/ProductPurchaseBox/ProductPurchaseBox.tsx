import { useState, useEffect } from 'react';
import style from './product-purchase-box.module.scss';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { AddToCartButton, QuickBuyButton } from '@/components/common';
import { selectIsMaxReached } from '@/store';
import { formatPrice } from '@/utils';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { addToCheckout, clearCheckout } from '@/store/slices/checkoutSlice';
import { useNavigate } from 'react-router';
import { ProductSize } from '@/types/products';
import { ProductSizes } from '../ProductSizes/ProductSizes';
import { ProductSizesSkeleton } from '../ProductSizes/ProductSizesSkeleton';

interface ProductPurchaseBoxProps {
    productId: number;
    quantity: number;
    hasDiscount: boolean;
    originalPrice: number;
    discountedPrice: number;
    handleCart(sizeId: number, type: 'inc' | 'dec'): void;
    sizes?: ProductSize[];
    setSelectedSizeId(id: number): void;
    selectedSizeId: number | undefined;
    hasSizes: boolean;
    isMobile: boolean;
    isSizesLoading?: boolean;
}

export const ProductPurchaseBox = ({
    productId,
    quantity,
    hasDiscount,
    originalPrice,
    discountedPrice,
    handleCart,
    isMobile,
    sizes,
    hasSizes,
    setSelectedSizeId,
    selectedSizeId,
    isSizesLoading = false,
}: ProductPurchaseBoxProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isWarning, setIsWarning] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const isSizeSelected = !hasSizes || (selectedSizeId !== undefined && selectedSizeId !== null);
    const selectedSize = hasSizes && sizes ? sizes.find(s => s.id === selectedSizeId) : null;

    const currentStock = hasSizes && sizes
        ? (selectedSize ? selectedSize.stock : (sizes.some(s => s.stock > 0) ? 5 : 0))
        : 0;
    const currentInStock = currentStock > 0;

    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, currentStock ?? 0));
    const cartProduct: CartProduct[] = [{ sizeId: selectedSizeId as number, productId: productId, quantity: 1 }];

    const triggerWarning = () => {
        setIsWarning(true);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
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
        dispatch(clearCheckout());
        dispatch(addToCheckout(cartProduct));
        navigate('/checkout');
    };

    useEffect(() => {
        if (isSizeSelected) {
            setIsWarning(false);
        }
    }, [isSizeSelected]);

    const isLowStock = currentStock > 0 && currentStock < 5;
    const isOutOfStock = currentStock === 0;

    let stockClass = style['purchase-box__stock'];
    if (hasSizes && !selectedSizeId) {
    } else if (isLowStock) {
        stockClass += ` ${style['purchase-box__stock--low']}`;
    } else if (isOutOfStock) {
        stockClass += ` ${style['purchase-box__stock--out']}`;
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
            <div className={style['price-section']}>
                <div className={style['price-info']}>
                    <span className={style['price-label']}>Current Price</span>
                    <div className={style['price-values']}>
                        {hasDiscount ? (
                            <>
                                <span className={style['discount-price']}>{formatPrice(discountedPrice)}</span>
                                <span className={style['original-price']}>{formatPrice(originalPrice)}</span>
                            </>
                        ) : (
                            <span className={style['discount-price']}>{formatPrice(originalPrice)}</span>
                        )}
                        {hasDiscount && (
                            <div className={style['discount-badge']}>
                                Save {formatPrice(originalPrice - discountedPrice)}
                            </div>
                        )}
                    </div>
                </div>
                <span
                    className={stockClass}
                    data-stock={hasSizes && !selectedSizeId ? 'select-size' : isOutOfStock ? 'empty' : isLowStock ? 'low' : 'in stock'}
                >
                    {stockText}
                </span>
            </div>

            {(isSizesLoading || (sizes && sizes.length > 0)) && !isMobile ? (
                <div className={style['purchase-box__sizes-container']}>
                    {isSizesLoading ? (
                        <ProductSizesSkeleton />
                    ) : (
                        sizes && (
                            <ProductSizes
                                sizes={sizes}
                                activeSizeId={selectedSizeId}
                                onSizeSelect={setSelectedSizeId}
                                isCompact={true}
                            />
                        )
                    )}
                </div>
            ) : ''}

            {(!isSizeSelected && isWarning) && (
                <div className={`${style['purchase-box__warning']} ${isShaking ? style['purchase-box__warning--shake'] : ''}`}>
                    Please select a size to purchase this item
                </div>
            )}

            <div className={style['actions']}>
                <AddToCartButton
                    quantity={quantity}
                    onAddToCart={handleAddToCart}
                    onIncrement={() => handleCart(selectedSizeId as number, 'inc')}
                    onDecrement={() => handleCart(selectedSizeId as number, 'dec')}
                    inStock={currentInStock}
                    isMaxReached={isMaxReached}
                    className={style['add-to-cart']}
                    buttonText={isSizeSelected ? 'Add to Cart' : 'Select Size'}
                    outOfStockText="Out of Stock"
                />
                <QuickBuyButton
                    onClick={handleQuickBuy}
                    disabled={!currentInStock}
                    className={style['quick-buy']}
                />
            </div>

            {!currentInStock && (
                <div className={style['out-of-stock-notice']}>
                    Out of stock. Sign up for notifications.
                </div>
            )}
        </div>
    );
};
