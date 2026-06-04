import style from './product-purchase-box.module.scss';
import { useAppSelector } from '@/hooks';
import { AddToCartButton, QuickBuyButton } from '@/components/common';
import { selectIsMaxReached } from '@/store';
import { formatPrice } from '@/utils';

interface ProductPurchaseBoxProps {
    productId: number;
    quantity: number;
    hasDiscount: boolean;
    originalPrice: number;
    discountedPrice: number;
    handleCart(id: number, type: 'inc' | 'dec'): void;
    inStock: boolean;
    stock: number;
}

export const ProductPurchaseBox = ({
    productId,
    quantity,
    hasDiscount,
    originalPrice,
    discountedPrice,
    handleCart,
    inStock,
    stock,
}: ProductPurchaseBoxProps) => {
    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, stock ?? 0));

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
                    </div>
                </div>
                
                {hasDiscount && (
                    <div className={style['discount-badge']}>
                        Save {formatPrice(originalPrice - discountedPrice)}
                    </div>
                )}
            </div>

            <div className={style['actions']}>
                <AddToCartButton
                    quantity={quantity}
                    onAddToCart={() => handleCart(productId, 'inc')}
                    onIncrement={() => handleCart(productId, 'inc')}
                    onDecrement={() => handleCart(productId, 'dec')}
                    inStock={inStock}
                    isMaxReached={isMaxReached}
                    className={style['add-to-cart']}
                />
                <QuickBuyButton
                    onClick={() => console.log('Quick buy', productId)}
                    disabled={!inStock}
                    className={style['quick-buy']}
                />
            </div>

            {!inStock && (
                <div className={style['out-of-stock-notice']}>
                    Out of stock. Sign up for notifications.
                </div>
            )}
        </div>
    );
};
