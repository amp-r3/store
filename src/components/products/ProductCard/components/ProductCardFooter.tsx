import { FC } from 'react';
import { Product } from '@/types/products';
import style from '../productCard.module.scss';
import { useAppDispatch } from '@/hooks';
import { changeQuantity } from '@/store/slices/cartSlice';
import { AddToCartButton } from '@/components/common';

interface ProductCardFooterProps {
    product: Product;
    price: number;
    discountedPrice: number;
    hasDiscount: boolean;
    handleAddToCart: (product: Product) => void;
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
    handleAddToCart,
    inStock,
    isMaxReached,
}) => {
    const dispatch = useAppDispatch();
    const onIncrease  = (id: number) => { dispatch(changeQuantity({ id, type: 'inc' })); };
    const onDecrease  = (id: number) => { dispatch(changeQuantity({ id, type: 'dec' })); };
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
                onAddToCart={() => handleAddToCart(product)}
                onIncrement={() => onIncrease(product.id)}
                onDecrement={() => onDecrease(product.id)}
                inStock={inStock}
                isMaxReached={isMaxReached}
                size="small"
            />
        </div>
    );
};