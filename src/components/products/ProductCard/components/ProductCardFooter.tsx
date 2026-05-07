import { FC } from 'react';
import { Product } from '@/types/products';
import style from '../productCard.module.scss';
import { AddToCartButton } from '@/components/common';

interface ProductCardFooterProps {
    product: Product;
    price: number;
    discountedPrice: number;
    hasDiscount: boolean;
    handleCart: (id: number, type: 'inc' | 'dec') => void;
    inStock: boolean;
    isMaxReached: boolean;
    quantity: number;
}

const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
};

export const ProductCardFooter: FC<ProductCardFooterProps> = ({
    product,
    quantity,
    price,
    discountedPrice,
    hasDiscount,
    handleCart,
    inStock,
    isMaxReached,
}) => {
    return (
        <div className={style.card__footer}>
            <div className={style.card__price_wrapper}>
                {hasDiscount && (
                    <span className={style.card__oldPrice}>{formatPrice(price)}</span>
                )}
                <span className={style.card__price}>{formatPrice(discountedPrice)}</span>
            </div>

            <AddToCartButton
                quantity={quantity}
                onAddToCart={() => handleCart(product.id, 'inc')}
                onIncrement={() => handleCart(product.id, 'inc')}
                onDecrement={() => handleCart(product.id, 'dec')}
                inStock={inStock}
                isMaxReached={isMaxReached}
                size="small"
            />
        </div>
    );
};