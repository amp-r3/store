import style from './product-purchase-box.module.scss';
import { useAppSelector } from '@/hooks';
import { AddToCartButton } from '@/components/common';
import { selectIsMaxReached } from '@/store';

interface ProductPurchaseBoxProps {
    productId: number;
    quantity: number;
    originalPrice: string;
    discountedPriceFormatted: string;
    handleCart(id: number, type: 'inc' | 'dec'): void;
    inStock: boolean;
    stock: number;
}

export const ProductPurchaseBox = ({
    productId,
    quantity,
    originalPrice,
    discountedPriceFormatted,
    handleCart,
    inStock,
    stock,
}: ProductPurchaseBoxProps) => {
    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, stock ?? 0));
    return (
        <div className={style['purchase-box']}>
            <div className={style['price-block']}>
                {
                    discountedPriceFormatted ?
                        <>
                            <p className={style['price']}>{originalPrice}</p>
                            <p className={style['discount-price']}>{discountedPriceFormatted}</p>
                        </> :
                        <p className={style['discount-price']}>{originalPrice}</p>
                }
            </div>
            <AddToCartButton
                quantity={quantity}
                onAddToCart={() => handleCart(productId, 'inc')}
                onIncrement={() => handleCart(productId, 'inc')}
                onDecrement={() => handleCart(productId, 'dec')}
                inStock={inStock}
                isMaxReached={isMaxReached}
                size="large"
            />
        </div>
    );
};