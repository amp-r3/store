import { FC } from 'react';
import { Product } from '@/types/products';
import style from '../productCard.module.scss';
import { formatPrice } from '@/utils';
import { AddToCartButton } from '@/components/common';

interface ProductCardFooterProps {
    productId: number;
    basePrice: number;
    price: number;
    hasDiscount: boolean;
    handleCart: (id: number, type: 'inc' | 'dec') => void;
    inStock: boolean;
    isMaxReached: boolean;
    quantity: number;
}

export const ProductCardFooter: FC<ProductCardFooterProps> = ({
    productId,
    basePrice,
    price,
    quantity,
    hasDiscount,
    handleCart,
    inStock,
    isMaxReached,
}) => {
    return (
        <div className={style.card__footer}>
            <div className={style.card__price_wrapper}>
                {hasDiscount && (
                    <span className={style.card__oldPrice}>{formatPrice(basePrice)}</span>
                )}
                <span className={style.card__price}>{formatPrice(price)}</span>
            </div>

            <AddToCartButton
                quantity={quantity}
                onAddToCart={() => handleCart(productId, 'inc')}
                onIncrement={() => handleCart(productId, 'inc')}
                onDecrement={() => handleCart(productId, 'dec')}
                inStock={inStock}
                isMaxReached={isMaxReached}
                size="small"
            />
        </div>
    );
};